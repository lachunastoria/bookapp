import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthPageComponent } from '@bookapp/angular/desktop/auth';
import { BrowseBooksPageComponent } from '@bookapp/angular/desktop/books/browse-books';
import { MainLayoutComponent } from '@bookapp/angular/desktop/main-layout';
import { AuthGuard, RolesGuard } from '@bookapp/angular/shared';
import { ROLES } from '@bookapp/shared';

@NgModule({
  imports: [
    RouterModule.forRoot(
      [
        {
          path: 'auth',
          component: AuthPageComponent
        },
        {
          path: '',
          component: MainLayoutComponent,
          canActivate: [AuthGuard],
          children: [
            {
              path: '',
              pathMatch: 'full',
              redirectTo: '/books/browse'
            },
            {
              path: 'books/browse',
              component: BrowseBooksPageComponent,
              canActivate: [AuthGuard]
            },
            {
              path: 'books/add',
              loadChildren: () =>
                import('@bookapp/angular/desktop/books/add-book').then(
                  m => m.AddBookModule
                ),
              canLoad: [AuthGuard, RolesGuard],
              data: {
                roles: [ROLES.ADMIN]
              }
            },
            {
              path: 'password',
              loadChildren: () =>
                import('@bookapp/angular/desktop/password').then(
                  m => m.PasswordModule
                ),
              canLoad: [AuthGuard]
            },
            {
              path: 'profile',
              loadChildren: () =>
                import('@bookapp/angular/desktop/profile').then(
                  m => m.ProfileModule
                ),
              canLoad: [AuthGuard]
            }
          ]
        }
      ],
      { initialNavigation: 'enabled' }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
