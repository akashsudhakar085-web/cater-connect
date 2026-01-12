import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
    try {
        // Initialize Razorpay
        // We use env vars for keys. 
        // Note: NEXT_PUBLIC_RAZORPAY_KEY_ID is usually safe to expose, 
        // but RAZORPAY_KEY_SECRET must be server-side only.
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const order = await razorpay.orders.create({
            amount: 9900, // 99.00 INR in paise
            currency: 'INR',
            receipt: 'receipt_' + Math.random().toString(36).substring(7),
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { error: 'Error creating order' },
            { status: 500 }
        );
    }
}
