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

    // 2. Latency check (Open-Meteo)
    const start = Date.now();
    await fetch('https://archive-api.open-meteo.com/v1/archive?latitude=52.52&longitude=13.41&start_date=2024-01-01&end_date=2024-01-01&daily=temperature_2m_max');
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
