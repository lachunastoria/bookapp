import { Component, ViewChild, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';

import { BooksPageBase } from '@bookapp/angular/base';
import { LoaderPlatformService, RouterExtensions, StoreService } from '@bookapp/angular/core';
import { BooksService } from '@bookapp/angular/data-access';
import { BookSearchComponent, BooksListComponent } from '@bookapp/angular/ui-mobile';
import { Book, BooksFilter } from '@bookapp/shared/interfaces';

import { ModalDialogOptions, ModalDialogService } from '@nativescript/angular';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';

import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { getViewById, SegmentedBarItem, ViewBase } from '@nativescript/core';
import { getRootView } from '@nativescript/core/application';

interface SortOption {
  value: BooksFilter['sortValue'];
  label: string;
}

@Component({
  moduleId: module.id,
  selector: 'bookapp-browse-books-page',
  templateUrl: './browse-books-page.component.html',
  styleUrls: ['./browse-books-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BooksService],
})
export class BrowseBooksPageComponent extends BooksPageBase {
  sortOptions: SortOption[] = [
    {
      value: 'rating_desc',
      label: 'All books',
    },
    {
      value: 'createdAt_desc',
      label: 'Most recent',
    },
    {
      value: 'views_desc',
      label: 'Most popular',
    },
  ];

  sortItems: SegmentedBarItem[] = this.sortOptions.map((option) => {
    const item = new SegmentedBarItem();
    item.title = option.label;
    return item;
  });

  @ViewChild(BooksListComponent, { static: true })
  booksList: BooksListComponent;

  private selectedOption = new BehaviorSubject<number>(0);

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly modalService: ModalDialogService,
    private readonly routerExtensions: RouterExtensions,
    private readonly loaderService: LoaderPlatformService,
    storeService: StoreService,
    booksService: BooksService
  ) {
    super(storeService, booksService, false);
    this.setInitialSorting();
    this.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (loading ? this.loaderService.start() : this.loaderService.stop()));
  }

  get selectedOption$() {
    return this.selectedOption.asObservable();
  }

  onDrawerButtonTap() {
    const sideDrawer = getViewById(getRootView() as any, 'drawer') as RadSideDrawer;
    sideDrawer.toggleDrawerState();
  }

  onSelectedIndexChange(args: any) {
    const selectedIndex = args.object.selectedIndex;
    this.selectedOption.next(selectedIndex);

    const { value } = this.sortOptions[selectedIndex];

    super.sort(value);
    this.booksList.scrollToIndex(0);
  }

  async onSearchButtonTap() {
    const options: ModalDialogOptions = {
      context: { paid: false },
      fullscreen: true,
      animated: false,
      viewContainerRef: this.viewContainerRef,
    };

    const book: Book = await this.modalService.showModal(BookSearchComponent, options);

    if (book) {
      // wait when modal close
      setTimeout(() => {
        this.routerExtensions.navigateByUrl(
          book.paid
            ? `/books/buy/${book.url}?bookId=${book._id}`
            : `/books/browse/${book.url}?bookId=${book._id}`
        );
      }, 0);
    }
  }

  private setInitialSorting() {
    const filter = this.filter.getValue();

    if (filter) {
      const { sortValue } = filter;
      const index = this.sortOptions.findIndex((option) => option.value === sortValue);
      this.selectedOption.next(index !== -1 ? index : 0);
    }
  }
}
