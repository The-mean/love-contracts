const API_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Bir hata oluştu');
        }
        return data;
    }
    throw new Error('Sunucudan geçersiz yanıt alındı');
};

export const api = {
    auth: {
        login: async (email, password) => {
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                return handleResponse(response);
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },

        register: async (email, password) => {
            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                return handleResponse(response);
            } catch (error) {
                console.error('Register error:', error);
                throw error;
            }
        },
    },

    contracts: {
        create: async (contractData, token) => {
            try {
                const response = await fetch(`${API_URL}/contracts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(contractData),
                });
                return handleResponse(response);
            } catch (error) {
                console.error('Create contract error:', error);
                throw error;
            }
        },

        getAll: async (token) => {
            try {
                const response = await fetch(`${API_URL}/contracts`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                return handleResponse(response);
            } catch (error) {
                console.error('Get contracts error:', error);
                throw error;
            }
        },

        getById: async (id, token) => {
            try {
                const response = await fetch(`${API_URL}/contracts/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                return handleResponse(response);
            } catch (error) {
                console.error('Get contract error:', error);
                throw error;
            }
        },

        update: async (id, contractData, token) => {
            try {
                const response = await fetch(`${API_URL}/contracts/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(contractData),
                });
                return handleResponse(response);
            } catch (error) {
                console.error('Update contract error:', error);
                throw error;
            }
        },

        delete: async (id, token) => {
            try {
                const response = await fetch(`${API_URL}/contracts/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                return handleResponse(response);
            } catch (error) {
                console.error('Delete contract error:', error);
                throw error;
            }
        },
    },
}; 