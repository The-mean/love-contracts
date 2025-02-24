import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import ReferralDashboard from '../components/ReferralDashboard';

const Dashboard = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('contracts');
    const { user } = useAuth();

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/contracts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch contracts');
            }

            const data = await response.json();
            setContracts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-neutral">My Contracts</h1>
                    <Link to="/create-contract">
                        <Button variant="primary" className="rounded-full">
                            Create New Contract
                        </Button>
                    </Link>
                </div>

                {contracts.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body text-center py-12">
                            <h2 className="card-title text-xl justify-center mb-4">No Contracts Yet</h2>
                            <p className="text-neutral/70 mb-6">
                                Create your first contract to get started!
                            </p>
                            <Link to="/create-contract" className="inline-block">
                                <Button variant="primary" className="rounded-full">
                                    Create New Contract
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contracts.map(contract => (
                            <div key={contract.id} className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title text-lg">{contract.title}</h2>
                                    <p className="text-neutral/70 line-clamp-2">{contract.content}</p>
                                    <div className="card-actions justify-between items-center mt-4">
                                        <div className="badge badge-outline">
                                            {contract.status === 'pending' ? 'Pending' : 'Approved'}
                                        </div>
                                        <Link to={`/contracts/${contract.id}`}>
                                            <Button variant="ghost" size="sm">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 