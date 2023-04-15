import { CurrencyPipe } from '@angular/common';
import {
  Component,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { isFunction } from 'lodash-es';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import {
  BehaviorSubject,
  Observable,
  Subject,
  fromEvent,
  takeUntil,
} from 'rxjs';

export const WINDOW = new InjectionToken<Window>('Window', {
  factory: () => window,
});

@Pipe({
  name: 'dynamicCurrency',
  pure: false,
})
class DynamicCurrencyPipe implements PipeTransform {
  transform(value?: number | string | null): string | null {
    return `£{value}`;
  }
}

@Injectable({
  providedIn: 'root',
})
class UtilService implements OnDestroy {
  #stop$ = new Subject<boolean>();
  #currentPressedKey = new BehaviorSubject<KeyboardEvent | undefined>(
    undefined
  );

  constructor(
    @Inject(WINDOW) window: Window,
    private currencyPipe: DynamicCurrencyPipe
  ) {
    if (
      isFunction(window?.addEventListener) &&
      isFunction(window?.removeEventListener)
    ) {
      fromEvent<KeyboardEvent>(window, 'keydown')
        .pipe(takeUntil(this.#stop$))
        .subscribe((res) => {
          this.#currentPressedKey.next(res);
        });

      fromEvent<KeyboardEvent>(window, 'keyup')
        .pipe(takeUntil(this.#stop$))
        .subscribe(() => {
          this.#currentPressedKey.next(undefined);
        });
    }
  }

  ngOnDestroy(): void {
    this.#stop$.next(true);
  }

  public test() {
    return this.currencyPipe.transform(2);
  }
}

@Component({
  selector: 'app-test',
  template: '<div>Component {{ test() }}</div>',
})
class TestComponent {
  constructor(private utilService: UtilService) {}

  test() {
    return this.utilService.test();
  }
}

@NgModule({
  declarations: [DynamicCurrencyPipe],
  exports: [DynamicCurrencyPipe],
  providers: [CurrencyPipe, DynamicCurrencyPipe],
})
class SharedModule {}

@NgModule({
  declarations: [TestComponent],
  imports: [SharedModule],
})
class AdminModule {}

describe('Will created detached nodes', () => {
  ngMocks.faster();

  beforeEach(() => {
    return MockBuilder(TestComponent, AdminModule).keep(UtilService);
  });

  it('should create 1', () => {
    const fixture = MockRender(TestComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create 2', () => {
    const fixture = MockRender(TestComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
