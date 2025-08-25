/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from "react";
import type { DevicesContextType } from "./_interface/DevicesContextType";
import { DevicesContext } from "./Devices.context";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { fetchMetainfo } from "@/store/slices/adb";
import { fetchApps, fetchUploads } from "@/store/slices/file";

export const DevicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [screenScale, setScreenScale] = useState(30);

    const [selectedDevices, setSelectedDevices] = useState<any[]>([]);
    const [deviceWSMap, setDeviceWSMap] = useState<Record<string, WebSocket | null>>({});

    // Lưu ws cho từng thiết bị
    const setDeviceWS = useCallback((id: string, ws: WebSocket | null) => {
        setDeviceWSMap(prev => ({ ...prev, [id]: ws }));
    }, []);

    // Gửi lệnh tới 1 thiết bị
    const sendToDevice = useCallback((id: string, data: any) => {
        const ws = deviceWSMap[id];
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }, [deviceWSMap]);

    // Gửi lệnh tới tất cả thiết bị
    const sendToAll = useCallback((data: any) => {
        Object.values(deviceWSMap).forEach(ws => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        });
    }, [deviceWSMap]);

    // Đóng ws 1 thiết bị
    const closeDeviceWS = useCallback((id: string) => {
        const ws = deviceWSMap[id];
        if (ws) {
            ws.close();
            setDeviceWS(id, null);
        }
    }, [deviceWSMap, setDeviceWS]);

    // Đóng ws tất cả thiết bị
    const closeAllWS = useCallback(() => {
        Object.keys(deviceWSMap).forEach(id => {
            closeDeviceWS(id);
        });
    }, [deviceWSMap, closeDeviceWS]);

    const value: DevicesContextType = {
        selectedDevices,
        setSelectedDevices,
        deviceWSMap,
        setDeviceWS,
        sendToDevice,
        sendToAll,
        closeDeviceWS,
        closeAllWS,
        screenScale,
        setScreenScale,
    };
    useEffect(() => {
        let mounted = true;
        const initialize = async () => {
            await Promise.all([
                dispatch(fetchMetainfo()),
                dispatch(fetchUploads(undefined)),
                dispatch(fetchApps(undefined))
            ])
            if (!mounted) return;
        };
        initialize();
        return () => {
            mounted = false;
        };
    }, [dispatch]);

    return (
        <DevicesContext.Provider
            value={value}
        >
            {children}
        </DevicesContext.Provider>
    );
};