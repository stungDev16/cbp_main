/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import type { DevicesContextType } from "./_interface/DevicesContextType";
import { DevicesContext } from "./Devices.context";
import { deviceService } from "@/apis/services/device/device-service";
import { toast } from "sonner";

export const DevicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<any[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<any[]>([]);


    const value: DevicesContextType = useMemo(() => ({
        selectedDevices,
        setSelectedDevices,
        data,
    }), [selectedDevices, data,]);
    useEffect(() => {
        let mounted = true;
        const initialize = async () => {
            const { data, success } = await deviceService.get_phone();
            if (!success) {
                toast.error("Failed to fetch device data");
                return
            };
            setData(data?.items || [])
            if (!mounted) return;
        };
        initialize();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <DevicesContext.Provider
            value={value}
        >
            {children}
        </DevicesContext.Provider>
    );
};