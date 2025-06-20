// Notification Service
export class notificationService {
  private static instance: notificationService;
  
  static getInstance(): notificationService {
    if (!notificationService.instance) {
      notificationService.instance = new notificationService();
    }
    return notificationService.instance;
  }
  
  success(message: string, duration = 5000): void {
    // Implementation for success notifications
  }
  
  error(message: string, duration = 8000): void {
    // Implementation for error notifications
  }
  
  warning(message: string, duration = 6000): void {
    // Implementation for warning notifications
  }
  
  info(message: string, duration = 4000): void {
    // Implementation for info notifications
  }
  
  // Withdrawal specific notifications
  withdrawalRequested(amount: number): void {
    this.success(`Withdrawal request for $${amount} submitted. Processing time: 10-20 minutes.`);
  }
  
  withdrawalCompleted(amount: number): void {
    this.success(`Withdrawal of $${amount} has been completed successfully.`);
  }
  
  withdrawalRejected(reason?: string): void {
    this.error(`Withdrawal request rejected. ${reason || 'Please contact support.'}`);
  }
}