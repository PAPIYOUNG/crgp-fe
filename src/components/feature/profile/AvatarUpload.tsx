'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadAvatarAction } from '@/lib/action/user.action';

type AvatarUploadProps = {
  avatarUrl?: string | null;
  fallback: string;
};

export default function AvatarUpload({
  avatarUrl,
  fallback,
}: AvatarUploadProps) {
  const fileInputEl = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const handleClickSave = () => {
    startTransition(async () => {
      if (file) {
        await uploadAvatarAction(file);
      }
    });
  };
  const ImageUrl = file ? URL.createObjectURL(file) : avatarUrl;

  return (
    <div>
      <input
        type="file"
        className="hidden"
        ref={fileInputEl}
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
          }
        }}
      />
      <Dialog
        onOpenChange={(current) => {
          if (!current) {
            setFile(null); //ล้าง React State >> Preview หาย
          }
          if (fileInputEl.current) {
            fileInputEl.current.value = ''; //ล้าง <input type="file"> ใน Browser
          }
        }}
      >
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute -right-3 -bottom-1 z-10 size-8 rounded-full bg-background shadow-sm"
              aria-label="Upload profile photo"
            >
              <Camera className="size-4" />
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Picture</DialogTitle>
            <input />
          </DialogHeader>
          <div className="flex justify-center">
            <Avatar className="size-75 border">
              <AvatarImage alt="User" src={ImageUrl ?? undefined} />
              <AvatarFallback className="bg-[#2d2150] text-4xl font-semibold text-white">
                {fallback}
              </AvatarFallback>
            </Avatar>
          </div>
          <DialogFooter>
            <div className="flex-1">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputEl.current?.click()}
                disabled={isPending}
              >
                Choose cover photo
              </Button>
              {file && (
                <div className="flex-1">
                  <Button
                    className="w-full"
                    onClick={handleClickSave}
                    disabled={isPending}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
