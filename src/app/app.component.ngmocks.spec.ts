import { AppComponent } from './app.component';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { AppModule } from './app.module';

// describe('AppComponent', () => {
//   ngMocks.faster();

//   beforeAll(() => {
//     return MockBuilder(AppComponent, AppModule);
//   });

//   it('should create the app', () => {
//     const fixture = MockRender(AppComponent);
//     const app = fixture.componentInstance;
//     expect(app).toBeTruthy();
//   });

//   it(`should have as title 'test'`, () => {
//     const fixture = MockRender(AppComponent);
//     const app = fixture.componentInstance;
//     expect(app.title).toEqual('test');
//   });

//   it('should render title', () => {
//     const fixture = MockRender(AppComponent);
//     fixture.detectChanges();
//     const compiled = fixture.nativeElement as HTMLElement;
//     expect(compiled.querySelector('.content span')?.textContent).toContain(
//       'test app is running!'
//     );
//   });
// });
