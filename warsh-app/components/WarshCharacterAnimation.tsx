import React, { useEffect, useMemo, useState } from "react";
import { Image, ImageStyle, StyleProp, View, ViewStyle } from "react-native";

import {
  warshCharacterAnimations,
  WarshCharacterAnimationId,
} from "../constants/warshCharacterAnimations";

type Props = {
  animation: WarshCharacterAnimationId;
  size?: number;
  paused?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function WarshCharacterAnimation({
  animation,
  size = 160,
  paused = false,
  style,
  imageStyle,
}: Props) {
  const asset = warshCharacterAnimations[animation];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
  }, [animation]);

  useEffect(() => {
    if (paused) return;
    const frameMs = 1000 / asset.fps;
    const timer = setInterval(() => {
      setFrame((current) => (current + 1) % asset.frames);
    }, frameMs);
    return () => clearInterval(timer);
  }, [asset.fps, asset.frames, animation, paused]);

  const aspectRatio = asset.frameWidth / asset.frameHeight;
  const height = size;
  const width = Math.round(size * aspectRatio);

  const sheetStyle = useMemo(
    () => ({
      width: width * asset.frames,
      height,
      transform: [{ translateX: -frame * width }],
    }),
    [asset.frames, frame, height, width],
  );

  return (
    <View style={[{ width, height, overflow: "hidden" }, style]}>
      <Image
        source={asset.spritesheet}
        resizeMode="stretch"
        style={[sheetStyle, imageStyle]}
      />
    </View>
  );
}
