import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { kakaoAuthorize } from "@/shared/lib/kakao";

type LoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const handleLogin = () => {
    try {
      kakaoAuthorize();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "카카오 로그인에 실패했습니다.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6 p-8 sm:max-w-md">
        <DialogHeader className="items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <span className="text-xl font-bold">토</span>
          </div>
          <DialogTitle className="text-xl font-bold">
            토동산에 오신 것을 환영합니다
          </DialogTitle>
          <DialogDescription className="text-sm">
            카카오 계정으로 간편하게 로그인하고 동네 이슈 예측에 참여해보세요.
          </DialogDescription>
        </DialogHeader>

        <Button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-sm font-bold text-[#191919] transition-all hover:bg-[#FEE500]/90"
          onClick={handleLogin}
        >
          <MessageCircle className="size-5 text-[#191919]" />
          카카오 계정으로 로그인
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          로그인 시{" "}
          <a href="#" className="underline underline-offset-2 hover:text-foreground">
            이용약관
          </a>{" "}
          및{" "}
          <a href="#" className="underline underline-offset-2 hover:text-foreground">
            개인정보처리방침
          </a>
          에 동의하게 됩니다.
        </p>
      </DialogContent>
    </Dialog>
  );
}
