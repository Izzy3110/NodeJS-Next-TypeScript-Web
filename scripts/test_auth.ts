const BASE_URL = 'http://localhost:3001';

async function testEndpoint(name: string, url: string, method = 'GET', body: any = null) {
    try {
        const options: any = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const res = await fetch(url, options);
        let data;
        try {
            data = await res.json();
        } catch (e) {
            data = await res.text();
        }

        const success = res.status >= 200 && res.status < 300;
        console.log(`[${success ? 'PASS' : 'FAIL'}] ${name} (${method} ${url}) - Status: ${res.status}`);
        if (!success) {
            console.error('Error response:', data);
        }
        return { status: res.status, data };
    } catch (error: any) {
        console.error(`[ERROR] ${name} - ${error.message}`);
        return { error };
    }
}

async function runTests() {
    console.log('Starting Authentication and User API Tests...');

    // 1. Create a user
    const createRes = await testEndpoint('Create User', `${BASE_URL}/api/user`, 'POST', {
        username: 'test_user',
        password: 'password123',
        email: 'test@example.com'
    });

    // 2. Login with username
    await testEndpoint('Login Username', `${BASE_URL}/api/login`, 'POST', {
        username: 'test_user',
        password: 'password123'
    });

    // 3. Login with email
    const loginRes = await testEndpoint('Login Email', `${BASE_URL}/api/login`, 'POST', {
        email: 'test@example.com',
        password: 'password123'
    });

    if (loginRes.data && loginRes.data.user) {
        const userId = loginRes.data.user.id;

        // 4. Update user
        await testEndpoint('Update User', `${BASE_URL}/api/user`, 'PUT', {
            id: userId,
            username: 'updated_user'
        });

        // 5. Delete user
        await testEndpoint('Delete User', `${BASE_URL}/api/user?id=${userId}`, 'DELETE');
    }

    // 6. Verify API key gen is POST
    await testEndpoint('Generate API Key POST', `${BASE_URL}/api/generate_api_key`, 'POST');
    const getApiKeyRes = await testEndpoint('Generate API Key GET (should fail)', `${BASE_URL}/api/generate_api_key`, 'GET');
    
    if (getApiKeyRes.status === 405 || getApiKeyRes.status === 404) {
        console.log('[PASS] GET /api/generate_api_key correctly rejected');
    } else {
        console.error('[FAIL] GET /api/generate_api_key should have been rejected with 405 or 404');
    }

    console.log('Tests Completed.');
}

runTests();
