'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Printer } from 'lucide-react';

export default function ActionButtons({ id, type, status }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleValidate = async () => {
        if (!confirm('Are you sure you want to validate this? Stock will be updated.')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/inventory/${type}/${id}/validate`, {
                method: 'POST',
            });

            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to validate');
            }
        } catch (error) {
            console.error('Error validating:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this?')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/inventory/${type}/${id}/cancel`, {
                method: 'POST',
            });

            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to cancel');
            }
        } catch (error) {
            console.error('Error cancelling:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (status === 'draft') {
        return (
            <div className="flex gap-2">
                <button
                    onClick={handleValidate}
                    disabled={loading}
                    className="inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    title="Validate"
                >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {loading ? '...' : 'Validate'}
                </button>
                <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    title="Cancel"
                >
                    <XCircle className="mr-1 h-3 w-3" />
                    Cancel
                </button>
            </div>
        );
    }

    if (status === 'done') {
        return (
            <button
                onClick={handlePrint}
                className="inline-flex items-center rounded-md bg-gray-600 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 transition-colors"
                title="Print"
            >
                <Printer className="mr-1 h-3 w-3" />
                Print
            </button>
        );
    }

    return null;
}
