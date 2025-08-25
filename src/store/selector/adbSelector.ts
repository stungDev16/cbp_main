import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";

const selectAdbState = (state: RootState) => state.adb;

export const deviceObj = createSelector([selectAdbState], (adb) =>
    adb.devices?.find((d) => d.serial === adb.device)
);

export const displayObj = createSelector(
    [deviceObj, selectAdbState],
    (deviceObj, adb) =>
        deviceObj?.displays?.find((d: any) => d.id === adb.display)
);

export const displaySize = createSelector(
    [displayObj],
    (displayObj) => {
        const parts = displayObj ? displayObj.resolution.split("x") : ["0", "0"];
        const width = Number.parseInt(parts[0]) || 0;
        const height = Number.parseInt(parts[1]) || 0;

        return { width, height };
    }
);



export const audioEncoders = createSelector(
    [deviceObj],
    (deviceObj) => [
        { type: "audio", id: "off", codec: "off", name: "off" },
        { type: "audio", id: "raw", codec: "raw", name: "raw" },
        ...(deviceObj?.encoders?.filter((e: any) => e.type === "audio") || []).map(
            (e: any) => ({ ...e, id: e.name })
        ),
    ]
);

export const audioEncoderObj = createSelector(
    [audioEncoders, selectAdbState],
    (audioEncoders, adb) => audioEncoders.find((e) => e.id === adb.audioEncoder)
);

export const videoEncoders = createSelector(
    [deviceObj],
    (deviceObj) => {
        const encoders =
            deviceObj?.encoders?.filter((e: any) => e.type === "video") || [];
        const list = [];

        for (const encoder of encoders) {
            if (encoder.codec?.toLowerCase() === "h264") {
                const tinyH264 = {
                    ...encoder,
                    id: `TinyH264@${encoder.name}`,
                    decoder: "TinyH264",
                };
                list.push(tinyH264);

                const webcodecs = {
                    ...encoder,
                    id: `WebCodecs@${encoder.name}`,
                    decoder: "WebCodecs",
                };
                list.push(webcodecs);
            } else {
                list.push({
                    ...encoder,
                    id: `WebCodecs@${encoder.name}`,
                    decoder: "WebCodecs",
                });
            }
        }

        return [
            { type: "video", codec: "off", name: "off", decoder: "off" },
            ...list,
        ];
    }
);

export const videoEncoderObj = createSelector(
    [videoEncoders, selectAdbState],
    (videoEncoders, adb) =>
        videoEncoders.find((e) => {
            return e.id === adb.videoEncoder;
        })
);