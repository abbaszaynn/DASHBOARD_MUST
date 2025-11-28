"use client";


import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

type TimeAgoProps = {
    date: string | Date;
};

export default function TimeAgo({ date }: TimeAgoProps) {
    const [timeAgo, setTimeAgo] = useState<string>('');

    useEffect(() => {
        setTimeAgo(formatDistanceToNow(new Date(date), { addSuffix: true }));
    }, [date]);

    if (!timeAgo) {
        return null; // Or a placeholder skeleton
    }

    return <span>{timeAgo}</span>;
}
