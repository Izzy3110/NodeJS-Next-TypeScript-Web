"""
download_pdf.py — Download a generated invoice PDF from the remote server.
usage: python download_pdf.py <filename> <local_dir>
"""
import asyncio
import asyncssh
import sys
import os

FILENAME = sys.argv[1]
LOCAL_DIR = sys.argv[2] if len(sys.argv) > 2 else 'pdf/downloaded'
REMOTE = f'/home/node_user/pdf/generated/{FILENAME}'
LOCAL = os.path.join(LOCAL_DIR, FILENAME)

HOST = '46.225.3.88'
USER = 'root'
KEY = 'privkey'

async def main():
    async with asyncssh.connect(HOST, username=USER, client_keys=[KEY], known_hosts=None) as conn:
        async with conn.start_sftp_client() as sftp:
            await sftp.get(REMOTE, LOCAL)
            print(f'  -> Saved: {LOCAL}')

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

asyncio.run(main())
