
import React, { useState, useEffect } from 'react';
import { API, ContactMessage } from '../../api';

const ManageContacts: React.FC = () => {
    const [contacts, setContacts] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await API.contact.getAll();
            setContacts(data);
        } catch (err) {
            console.error('Failed to fetch contacts:', err);
            setError('Failed to load messages. Make sure the contacts table exists in the database.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await API.contact.delete(id);
                fetchContacts();
            } catch (err) {
                console.error('Failed to delete contact:', err);
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="text-center py-10">Loading messages...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Contact Messages ({contacts.length})</h2>
                    <button
                        onClick={fetchContacts}
                        className="text-blue-600 text-sm font-bold hover:underline"
                    >
                        Refresh
                    </button>
                </div>

                {error ? (
                    <div className="p-8 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <p className="text-sm text-gray-400">
                            Run this command in the backend folder:<br />
                            <code className="bg-gray-100 px-2 py-1 rounded mt-2 inline-block">node create-contacts.js</code>
                        </p>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xl mb-2">No messages yet</p>
                        <p className="text-sm">Messages from the contact form will appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {contacts.map((contact) => (
                            <div key={contact.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{contact.name}</h4>
                                        <a href={`mailto:${contact.email}`} className="text-blue-600 text-sm hover:underline">
                                            {contact.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-gray-400">
                                            {formatDate(contact.created_at)}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(contact.id)}
                                            className="text-red-500 text-xs font-bold uppercase hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                                    {contact.message}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageContacts;
