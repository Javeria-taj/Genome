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

    // 2. Latency check (Open-Meteo) with 3s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const start = Date.now();
    let apiStatus = 'operational';
    let latencyStr = '0ms';

    try {
      await fetch(
        'https://archive-api.open-meteo.com/v1/archive?latitude=52.52&longitude=13.41&start_date=2024-01-01&end_date=2024-01-01&daily=temperature_2m_max',
        {
          signal: controller.signal,
          next: { revalidate: 60 }
        }
      );
      latencyStr = `${Date.now() - start}ms`;
    } catch (e: any) {
      apiStatus = e.name === 'AbortError' ? 'timeout' : 'unstable';
    } finally {
      clearTimeout(timeout);
    }

    return NextResponse.json({
      status: dbStatus === 'operational' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: apiStatus,
      },
      metrics: {
        latency: latencyStr,
        uptime: process.uptime(),
      }
    }, { status: dbStatus === 'operational' ? 200 : 503 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unstable',
      timestamp: new Date().toISOString(),
      error: error.message || 'Health check failed',
    }, { status: 503 });
  }
}
