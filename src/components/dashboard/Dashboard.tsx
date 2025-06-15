"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Activity,
  Thermometer,
  Droplets,
  Gauge,
  Sun,
  Zap,
  Wifi,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

interface SensorData {
  id: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  icon: React.ComponentType<any>;
  min: number;
  max: number;
  lastUpdated: Date;
}

interface FirebaseData {
  sensorReadings: {
    cahaya: number[];
    dht11: {
      humidity: number;
      temperature: number;
    }[];
    peer: number[];
    soil: number[];
    ultrasonic: number[];
  };
}

export default function SensorDashboard() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const sensorRef = ref(database, "sensorReadings");

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const latestIndex =
        Math.max(
          data.dht11?.length || 0,
          data.soil?.length || 0,
          data.cahaya?.length || 0,
          data.ultrasonic?.length || 0,
          data.peer?.length || 0
        ) - 1;

      // Calculate status based on value ranges
      const getStatus = (
        value: number,
        min: number,
        max: number
      ): "normal" | "warning" | "critical" => {
        const range = max - min;
        const normalMin = min + range * 0.2;
        const normalMax = max - range * 0.2;
        const warningMin = min + range * 0.1;
        const warningMax = max - range * 0.1;

        if (value < warningMin || value > warningMax) {
          return "critical";
        } else if (value < normalMin || value > normalMax) {
          return "warning";
        }
        return "normal";
      };

      const currentTime = new Date();
      setLastUpdate(currentTime);

      // Create sensor objects based on Firebase data structure
      const sensorsRealtime: SensorData[] = [
        {
          id: "temp-01",
          name: "Temperature Sensor",
          type: "Temperature",
          value: data.dht11?.[latestIndex]?.temperature ?? 0,
          unit: "°C",
          status: getStatus(data.dht11?.[latestIndex]?.temperature ?? 0, 0, 50),
          icon: Thermometer,
          min: 0,
          max: 50,
          lastUpdated: currentTime,
        },
        {
          id: "hum-01",
          name: "Humidity Sensor",
          type: "Humidity",
          value: data.dht11?.[latestIndex]?.humidity ?? 0,
          unit: "%",
          status: getStatus(data.dht11?.[latestIndex]?.humidity ?? 0, 0, 100),
          icon: Droplets,
          min: 0,
          max: 100,
          lastUpdated: currentTime,
        },
        {
          id: "soil-01",
          name: "Soil Moisture",
          type: "Soil",
          value: data.soil?.[latestIndex] ?? 0,
          unit: "%",
          status: getStatus(data.soil?.[latestIndex] ?? 0, 0, 100),
          icon: Gauge,
          min: 0,
          max: 100,
          lastUpdated: currentTime,
        },
        {
          id: "light-01",
          name: "Light Sensor",
          type: "Light Intensity",
          value: data.cahaya?.[latestIndex] ?? 0,
          unit: "lux",
          status: getStatus(data.cahaya?.[latestIndex] ?? 0, 0, 1000),
          icon: Sun,
          min: 0,
          max: 1000,
          lastUpdated: currentTime,
        },
        {
          id: "ultra-01",
          name: "Distance Sensor",
          type: "Ultrasonic",
          value: data.ultrasonic?.[latestIndex] ?? 0,
          unit: "cm",
          status: getStatus(data.ultrasonic?.[latestIndex] ?? 0, 0, 300),
          icon: Zap,
          min: 0,
          max: 300,
          lastUpdated: currentTime,
        },
        {
          id: "peer-01",
          name: "Connection Status",
          type: "Peer",
          value: data.peer?.[latestIndex] ?? 0,
          unit: "",
          status: data.peer?.[latestIndex] === 1 ? "normal" : "critical",
          icon: Wifi,
          min: 0,
          max: 1,
          lastUpdated: currentTime,
        },
      ];

      setSensors(sensorsRealtime);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: string) => {
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

  const getStatusVariant = (status: string) => {
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

  // Format value based on sensor type
  const formatValue = (sensor: SensorData) => {
    if (sensor.id === "peer-01") {
      return sensor.value === 1 ? "Connected" : "Disconnected";
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
              2AEC1 Sensor Dashboard
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Real-time monitoring of {sensors.length} sensors with 5 Node
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:gap-6 mb-6 sm:mb-8">
          {sensors.map((sensor) => {
            const IconComponent = sensor.icon;
            return (
              <Card key={sensor.id} className="relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(
                    sensor.status
                  )}`}
                />

                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-base leading-tight">
                            {sensor.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {sensor.type}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={getStatusVariant(sensor.status)}
                        className="text-xs px-2 py-1"
                      >
                        {sensor.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatValue(sensor)}
                        </div>
                      </div>
                      {sensor.id !== "peer-01" && (
                        <div className="space-y-1">
                          <Progress
                            value={getProgressValue(sensor)}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>
                              {sensor.min}
                              {sensor.unit}
                            </span>
                            <span>
                              {sensor.max}
                              {sensor.unit}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-gray-400 text-center">
                        Updated: {sensor.lastUpdated.toLocaleTimeString()}
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex flex-row items-center">
                  <CardHeader className="py-4 flex-shrink-0 w-full sm:w-1/3 lg:w-1/4">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                      <div>
                        <CardTitle className="text-base lg:text-lg">
                          {sensor.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {sensor.type}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 flex-grow flex items-center justify-between">
                    <div className="flex items-center gap-4 lg:gap-6 w-full">
                      <div className="flex-shrink-0">
                        <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                          {formatValue(sensor)}
                        </div>
                        <div className="text-xs text-gray-400 hidden lg:block">
                          Updated: {sensor.lastUpdated.toLocaleTimeString()}
                        </div>
                      </div>
                      {sensor.id !== "peer-01" && (
                        <div className="flex-grow space-y-2 px-2 lg:px-4">
                          <Progress
                            value={getProgressValue(sensor)}
                            className="h-2 lg:h-3"
                          />
                          <div className="flex justify-between text-xs lg:text-sm text-gray-500">
                            <span>
                              {sensor.min}
                              {sensor.unit}
                            </span>
                            <span>
                              {sensor.max}
                              {sensor.unit}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex-shrink-0">
                        <Badge
                          variant={getStatusVariant(sensor.status)}
                          className="text-xs lg:text-sm px-2 lg:px-3 py-1"
                        >
                          {sensor.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Normal</span>
                  <span className="text-sm font-medium text-green-600">
                    {sensors.filter((s) => s.status === "normal").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Warning</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {sensors.filter((s) => s.status === "warning").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Critical</span>
                  <span className="text-sm font-medium text-red-600">
                    {sensors.filter((s) => s.status === "critical").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                Active Sensors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {sensors.length}
              </div>
              <p className="text-sm text-gray-500">All sensors online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                Last Update
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {lastUpdate.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500">Realtime from Firebase</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
