// lib/signOutManager.ts
"use client";

class SignOutManager {
  private isSigningOut: boolean = false;
  private signOutTimer: NodeJS.Timeout | null = null;

  // Debounced signOut - ป้องกันการเรียกซ้ำภายใน 2 วินาที
  async requestSignOut(callback: () => Promise<void>) {
    if (this.isSigningOut) {
      console.log("⏭️ SignOut already in progress, skip");
      return;
    }

    //  Clear timer ก่อนถ้ามี
    if (this.signOutTimer) {
      clearTimeout(this.signOutTimer);
    }

    //  Set timer เพื่อ debounce
    this.signOutTimer = setTimeout(async () => {
      if (this.isSigningOut) return;
      
      this.isSigningOut = true;
      console.log("🚪 Executing signOut...");
      
      try {
        await callback();
      } catch (error) {
        console.error("❌ SignOut error:", error);
      } finally {
        setTimeout(() => {
          this.isSigningOut = false;
        }, 3000);
      }
    }, 500); // debounce 500ms
  }

  reset() {
    this.isSigningOut = false;
    if (this.signOutTimer) {
      clearTimeout(this.signOutTimer);
      this.signOutTimer = null;
    }
  }

  isInProgress(): boolean {
    return this.isSigningOut;
  }
}

export const signOutManager = new SignOutManager();