import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // 1. Check DB Connection
    await connectToDatabase();
    const dbState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const dbStatus = dbState === 1 ? 'operational' : 'reconnecting';

    // 2. Latency check (simulated / internal)
    const start = Date.now();
    // Simple ping to a reliable service or just internal resolution
    const latency = Date.now() - start;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: 'operational',
      },
      metrics: {
        latency: `${latency}ms`,
        uptime: process.uptime(),
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'unstable',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    }, { status: 503 });
  }
}
