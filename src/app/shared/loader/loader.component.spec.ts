import { LoaderComponent } from './loader.component';
import { By } from '@angular/platform-browser';
import { MockBuilder, MockRender } from 'ng-mocks';

describe('LoaderComponent', () => {
  beforeEach(() => {
    return MockBuilder(LoaderComponent);
  });

  it('should create component', () => {
    // Act
    const fixture = MockRender(LoaderComponent);

    // Assert
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should display the default message and spinner', () => {
    // Act
    const fixture = MockRender(LoaderComponent, {}, {
      detectChanges: true
    });
    
    // Assert
    const loadingEl = fixture.debugElement.query(By.css('.loading'));
    expect(loadingEl).toBeTruthy();
    
    const spinnerEl = loadingEl.query(By.css('.spinner'));
    expect(spinnerEl).toBeTruthy();
    
    const messageEl = loadingEl.query(By.css('.message'));
    expect(messageEl).toBeTruthy();
    expect(messageEl.nativeElement.textContent.trim()).toBe('Loading...');
  });

  it('should display a custom message', () => {
    // Arrange
    const customMessage = 'Fetching data...';
    const params = {
      message: customMessage
    };
    
    // Act
    const fixture = MockRender(`
      <sprk-loader [message]="message"></sprk-loader>
    `, params);
    
    // Assert
    const loadingEl = fixture.debugElement.query(By.css('.loading'));
    const messageEl = loadingEl.query(By.css('.message'));
    expect(messageEl).toBeTruthy();
    expect(messageEl.nativeElement.textContent.trim()).toBe('Fetching data...');
  });

  it('should not display the message if it is empty', () => {
    // Arrange
    const params = {
      message: ''
    };
    
    // Act
    const fixture = MockRender(`
      <sprk-loader [message]="message"></sprk-loader>
    `, params);
    
    // Assert
    const loadingEl = fixture.debugElement.query(By.css('.loading'));
    expect(loadingEl.query(By.css('.message'))).toBeNull();
  });

  it('should hide spinner when showSpinner is false', () => {
    // Arrange
    const params = {
      showSpinner: false
    };
    
    // Act
    const fixture = MockRender(`
      <sprk-loader [showSpinner]="showSpinner"></sprk-loader>
    `, params);
    
    // Assert
    const loadingEl = fixture.debugElement.query(By.css('.loading'));
    expect(loadingEl.query(By.css('.spinner'))).toBeNull();
  });
});
