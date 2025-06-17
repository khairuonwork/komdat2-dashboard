// app/components/SensorDashboard.tsx

"use client";

import { useEffect, useState } from "react";
import { Activity, Thermometer, Droplets, Sun, Zap, Move } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getLatestSensorData } from "@/lib/firebase";
import type { FirebaseSensorData, SensorData } from "@/types/sensor";

export default function SensorDashboard() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      const data: FirebaseSensorData | null = await getLatestSensorData();
      if (!data) return;

      const getStatus = (
        value: number,
        min: number,
        max: number
      ): SensorData["status"] => {
        const range = max - min;
        const normalMin = min + range * 0.2;
        const normalMax = max - range * 0.2;
        const warningMin = min + range * 0.1;
        const warningMax = max - range * 0.1;

        if (value < warningMin || value > warningMax) return "critical";
        if (value < normalMin || value > normalMax) return "warning";
        return "normal";
      };

      const now = new Date();
      setLastUpdate(now);

      const sensorsRealtime: SensorData[] = [
        {
          id: "temp-sensor",
          name: "Temperature Sensor",
          type: "Temperature",
          value: data.dht11?.temperature ?? 0,
          unit: "°C",
          status: getStatus(data.dht11?.temperature ?? 0, 0, 50),
          icon: Thermometer,
          min: 0,
          max: 50,
          lastUpdated: now,
        },
        {
          id: "hum-sensor",
          name: "Humidity Sensor",
          type: "Humidity",
          value: data.dht11?.humidity ?? 0,
          unit: "%",
          status: getStatus(data.dht11?.humidity ?? 0, 0, 100),
          icon: Droplets,
          min: 0,
          max: 100,
          lastUpdated: now,
        },
        {
          id: "light-sensor",
          name: "Light Sensor",
          type: "Light Intensity",
          value: data.cahaya ?? 0,
          unit: "lux",
          status: getStatus(data.cahaya ?? 0, 0, 1000),
          icon: Sun,
          min: 0,
          max: 1000,
          lastUpdated: now,
        },
        {
          id: "distance-sensor",
          name: "Distance Sensor",
          type: "Ultrasonic",
          value: data.ultrasonic ?? 0,
          unit: "cm",
          status: getStatus(data.ultrasonic ?? 0, 0, 300),
          icon: Zap,
          min: 0,
          max: 300,
          lastUpdated: now,
        },
        {
          id: "pir-sensor",
          name: "Motion Sensor",
          type: "Motion",
          value: data.pir ?? 0,
          unit: "",
          status: data.pir === 1 ? "warning" : "normal",
          icon: Move,
          min: 0,
          max: 1,
          lastUpdated: now,
        },
      ];

      setSensors(sensorsRealtime);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // optional: polling 5 detik
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SensorData["status"]) => {
    switch (status) {
      case "normal":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: SensorData["status"]) => {
    switch (status) {
      case "normal":
        return "default";
      case "warning":
        return "secondary";
      case "critical":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getProgressValue = (sensor: SensorData) => {
    return ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
  };

  const formatValue = (sensor: SensorData) => {
    if (sensor.id === "pir-sensor") {
      return sensor.value === 1 ? "Motion Detected" : "No Motion";
    }
    return (
      <>
        {sensor.value}
        <span className="text-base lg:text-lg text-gray-500 ml-1">
          {sensor.unit}
        </span>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-3 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              2AEC1 Sensor Dashboard (LoRa System)
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Realtime sensor monitoring with Firebase
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:gap-6">
          {sensors.map((sensor) => {
            const Icon = sensor.icon;
            return (
              <Card key={sensor.id} className="relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(sensor.status)}`}
                />
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-base lg:text-lg">
                        {sensor.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {sensor.type}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(sensor.status)}>
                    {sensor.status}
                  </Badge>
                </div>
                <CardContent className="pt-0 px-4 pb-4">
                  <div className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {formatValue(sensor)}
                  </div>
                  {sensor.id !== "pir-sensor" && (
                    <>
                      <Progress value={getProgressValue(sensor)} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{sensor.min + sensor.unit}</span>
                        <span>{sensor.max + sensor.unit}</span>
                      </div>
                    </>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Updated: {sensor.lastUpdated.toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
