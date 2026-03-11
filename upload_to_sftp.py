import os
import asyncio
import asyncssh
import sys

# Configuration
HOST = "46.225.3.88"
PORT = 22
USER = "root"
PRIVATE_KEY_PATH = r"privkey"
LOCAL_ROOT = r"C:\Users\sasch\LocalCloud\repos\2026\Web\NodeJS-TypeScript\git\web"
REMOTE_ROOT = "/home/node_user"

# Excluded patterns
EXCLUDES = {"app.access.log", "app.log", ".git", ".idea", "venv", "__pycache__", ".agent", ".gemini", "node_modules", ".next", "docker-mariadb"}

# Concurrency limit
MAX_CONCURRENT_UPLOADS = 20
semaphore = asyncio.Semaphore(MAX_CONCURRENT_UPLOADS)

async def run_remote_command(conn, command):
    """Executes a command on the remote server and prints the output."""
    print(f"Executing remote: {command}")
    result = await conn.run(command, check=False)
    
    if result.stdout: print(f"STDOUT: {result.stdout.strip()}")
    if result.stderr: print(f"STDERR: {result.stderr.strip()}")
    
    if result.exit_status != 0:
        print(f"Command failed with exit status {result.exit_status}")
    return result.exit_status == 0

async def should_upload_file(sftp, local_path, remote_path):
    """Checks if a file should be uploaded based on mtime and size."""
    try:
        local_stat = os.stat(local_path)
        local_mtime = int(local_stat.st_mtime)
        local_size = local_stat.st_size
        
        try:
            remote_stat = await sftp.stat(remote_path)
            # asyncssh stat returns an SFTPAttrs object
            remote_mtime = int(remote_stat.mtime)
            remote_size = remote_stat.size
            
            if local_mtime <= remote_mtime and local_size == remote_size:
                return False, local_mtime
        except asyncssh.SFTPNoSuchFile:
            pass
            
        return True, local_mtime
    except Exception as e:
        print(f"Error checking status for {local_path}: {e}")
        return True, 0

async def upload_file(sftp, local_path, remote_path):
    """Uploads a single file if it's newer, with concurrency limiting."""
    async with semaphore:
        should_upload, local_mtime = await should_upload_file(sftp, local_path, remote_path)
        
        if should_upload:
            filename = os.path.basename(local_path)
            print(f"Uploading: {filename}")
            await sftp.put(local_path, remote_path, preserve=True)
            # asyncssh 'preserve=True' handles mtime, but we can also set it explicitly if needed
            # await sftp.utime(remote_path, (local_mtime, local_mtime))
            return True
        return False

async def sync_recursive(sftp, local_dir, remote_dir):
    """Recursively collects file upload tasks."""
    tasks = []
    
    # Ensure remote directory exists
    try:
        await sftp.mkdir(remote_dir)
    except asyncssh.SFTPFailure:
        pass  # Likely already exists
        
    for item in os.listdir(local_dir):
        if item in EXCLUDES:
            continue
            
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}" if remote_dir != "/" else f"/{item}"
        
        if os.path.isfile(local_path):
            tasks.append(upload_file(sftp, local_path, remote_path))
        elif os.path.isdir(local_path):
            tasks.extend(await sync_recursive(sftp, local_path, remote_path))
            
    return tasks

async def main(recreate_only=False):
    try:
        print(f"Connecting to {HOST}...")
        async with asyncssh.connect(HOST, port=PORT, username=USER, client_keys=[PRIVATE_KEY_PATH], known_hosts=None) as conn:
            print("SSH Connection established.")
            
            async with conn.start_sftp_client() as sftp:
                print(f"Starting async sync: {LOCAL_ROOT} -> {REMOTE_ROOT}")
                tasks = await sync_recursive(sftp, LOCAL_ROOT, REMOTE_ROOT)
                
                if not tasks:
                    print("No files to upload.")
                else:
                    print(f"Checking/Uploading {len(tasks)} files concurrently...")
                    results = await asyncio.gather(*tasks)
                    uploaded_count = sum(1 for r in results if r)
                    print(f"Upload complete. {uploaded_count} files transferred.")

            # Execute remote deployment commands
            commands = [
                f"chown -R node_user:node_user {REMOTE_ROOT}",
                f"cd {REMOTE_ROOT} && docker-compose up --build -d"
            ]
            
            if not recreate_only:
                commands.insert(1, f"cd {REMOTE_ROOT} && docker-compose down")
            
            for cmd in commands:
                if not await run_remote_command(conn, cmd):
                    print("Aborting due to remote command failure.")
                    break
                    
            print("Async Deployment finished successfully.")

    except Exception as e:
        print(f"An error occurred during async deployment: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Upload files via SFTP and optionally recreate Docker containers.")
    parser.add_argument("--recreate_only", action="store_true", help="Run 'docker-compose down' before 'docker-compose up'")
    args = parser.parse_args()

    if sys.platform == 'win32':
        # Recommended for Windows to avoid ProactorEventLoop issues with SSH
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    asyncio.run(main(recreate_only=args.recreate_only))
