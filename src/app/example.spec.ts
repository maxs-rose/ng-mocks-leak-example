import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Injectable,
  InjectionToken,
  LOCALE_ID,
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
  Subscription,
  fromEvent,
  of,
  takeUntil,
} from 'rxjs';

const CURRENT_CURRENCY_SYMBOL = new InjectionToken<Observable<string>>(
  'Current currency symbol'
);

export const WINDOW = new InjectionToken<Window>('Window', {
  factory: () => window,
});

@Pipe({
  name: 'dynamicCurrency',
  pure: false,
})
class DynamicCurrencyPipe implements OnDestroy, PipeTransform {
  #latestValue: string | null = null;
  #transformSubscription?: Subscription;
  #previousValue?: number | string;

  #detetorRef: ChangeDetectorRef | null;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(CURRENT_CURRENCY_SYMBOL)
    private currentCurrencySymbol: Observable<string>,
    private currencyPipe: CurrencyPipe,
    ref: ChangeDetectorRef
  ) {
    this.#detetorRef = ref;
  }

  transform(value?: number | string | null): string | null {
    if (!this.isValue(value)) {
      return null;
    }

    if (value !== this.#previousValue) {
      this.#previousValue = value!;
      this.#transformSubscription?.unsubscribe();
      this.#transformSubscription = this.currentCurrencySymbol.subscribe(
        (currentSymbol) => {
          this.updateValue(value!, currentSymbol);
        }
      );
    }

    return this.#latestValue;
  }

  updateValue(value: number | string, symbol: string) {
    this.#latestValue = this.currencyPipe.transform(value, this.locale, symbol);
    this.#detetorRef?.markForCheck();
  }

  isValue(value?: number | string | null) {
    return !(value === null || value === undefined || value === '');
  }

  ngOnDestroy() {
    this.#transformSubscription?.unsubscribe();
    this.#detetorRef = null;
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
