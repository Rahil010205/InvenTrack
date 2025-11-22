'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function ValidateButton({ id, type }) {
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

    return (
        <button
            onClick={handleValidate}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            title="Validate and Update Stock"
        >
            <CheckCircle className="mr-1 h-3 w-3" />
            {loading ? '...' : 'Validate'}
        </button>
    );
}
