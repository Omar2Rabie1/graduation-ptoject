import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditLogsService } from '../../../../core/services/admin/audit-logs.service';



describe('AuditLogs', () => {
  let component: AuditLogsService;
  let fixture: ComponentFixture<AuditLogsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLogsService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AuditLogsService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
