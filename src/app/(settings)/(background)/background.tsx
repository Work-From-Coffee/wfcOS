import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import {
  backgroundSettingsAtom,
  BackgroundSettings,
  previewBackgroundAtom,
  BackgroundFit,
  CUSTOM_BACKGROUND_URL,
  isCustomBackgroundUrl,
} from "@/application/atoms/backgroundAtom";
import { playSound } from "@/infrastructure/lib/utils";
import {
  getUploadedBackgroundObjectUrl,
  saveUploadedBackground,
} from "@/infrastructure/utils/backgroundImageStorage";

// Import the components
import { BackgroundSelector } from "./components/BackgroundSelector";
import { NoImageOption } from "./components/NoImageOption";
import { BackgroundUploader } from "./components/BackgroundUploader";
import { BackgroundFitSelector } from "./components/BackgroundFitSelector";
import { SettingsActionButtons } from "@/presentation/components/shared/settings/SettingsActionButtons";

// Main component
interface BackgroundChangerProps {
  onClose?: () => void;
}

export const BackgroundChanger: React.FC<BackgroundChangerProps> = ({
  onClose,
}) => {
  const [savedSettings, setSavedSettings] = useAtom(backgroundSettingsAtom);
  const [previewSettings, setPreviewSettings] = useAtom(previewBackgroundAtom);

  // Initialize temp settings to saved settings
  const [tempSettings, setTempSettings] =
    useState<BackgroundSettings>(savedSettings);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Effect to initialize tempSettings when savedSettings changes
  useEffect(() => {
    setTempSettings(savedSettings);
  }, [savedSettings]);

  // Load the saved uploaded image preview from durable local storage.
  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadUploadedImage = async () => {
      if (savedSettings.url?.startsWith("data:image")) {
        const persistedUrl = await saveUploadedBackground(savedSettings.url);
        if (!isMounted) return;
        setSavedSettings((prev) => ({ ...prev, url: persistedUrl }));
        setTempSettings((prev) => ({ ...prev, url: persistedUrl }));
      }

      if (!isCustomBackgroundUrl(savedSettings.url)) {
        if (isMounted) {
          setUploadedImage(null);
        }
        return;
      }

      objectUrl = await getUploadedBackgroundObjectUrl();
      if (isMounted) {
        setUploadedImage(objectUrl);
      }
    };

    void loadUploadedImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [savedSettings.url, setSavedSettings]);

  // Update global preview whenever local temp settings change
  useEffect(() => {
    if (JSON.stringify(tempSettings) !== JSON.stringify(savedSettings)) {
      setPreviewSettings(tempSettings);
    } else {
      setPreviewSettings(null);
    }
  }, [tempSettings, savedSettings, setPreviewSettings]);

  // Reset preview background when component unmounts
  useEffect(() => {
    return () => {
      setPreviewSettings(null);
    };
  }, [setPreviewSettings]);

  const handleSelectBackground = (bgUrl: string | null) => {
    setTempSettings((prev) => ({ ...prev, url: bgUrl }));
  };

  const handleChangeFit = (value: string) => {
    setTempSettings((prev) => ({
      ...prev,
      fit: value as BackgroundFit,
    }));
  };

  const handleUploadImage = (image: string) => {
    setUploadedImage(image);
  };

  const handleApply = async () => {
    playSound("/sounds/click.mp3", "apply");
    let nextSettings = tempSettings;

    if (tempSettings.url?.startsWith("data:image")) {
      const persistedUrl = await saveUploadedBackground(tempSettings.url);
      nextSettings = {
        ...tempSettings,
        url: persistedUrl,
      };
    } else if (tempSettings.url === CUSTOM_BACKGROUND_URL) {
      nextSettings = {
        ...tempSettings,
        url: CUSTOM_BACKGROUND_URL,
      };
    }

    setSavedSettings(nextSettings);
    setPreviewSettings(null);
    onClose?.();
  };

  const handleCancel = () => {
    playSound("/sounds/click.mp3", "cancel");
    setPreviewSettings(null);
    onClose?.();
  };

  // Check if the global preview atom is set (meaning changes are staged)
  const hasChanges = previewSettings !== null;

  return (
    <div className="flex flex-col gap-2 items-center justify-start text-secondary h-full p-4">
      {/* Background Options */}
      <div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4 w-full">
          {/* No Image Option */}
          <NoImageOption
            isSelected={tempSettings.url === null}
            onSelect={() => handleSelectBackground(null)}
          />

          {/* Upload Image Slot */}
          <BackgroundUploader
            uploadedImage={uploadedImage}
            tempSettings={tempSettings}
            onSelectBackground={handleSelectBackground}
            onUploadImage={handleUploadImage}
          />
        </div>

        {/* Background selector component */}
        <BackgroundSelector
          tempSettings={tempSettings}
          onSelectBackground={handleSelectBackground}
        />
      </div>

      {/* Fit Options */}
      <BackgroundFitSelector
        fit={tempSettings.fit}
        onChangeFit={handleChangeFit}
      />

      {/* Action Buttons */}
      <SettingsActionButtons
        hasChanges={hasChanges}
        onApply={handleApply}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default BackgroundChanger;
