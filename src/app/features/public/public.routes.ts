import { Routes } from '@angular/router';
import { UserDashboard } from './user-dashboard/user-dashboard'; // تأكدي من صحة المسار حسب مكان الملف
import { UserProfileComponent } from './user/user-profile/user-profile';
import { LandingPageComponent } from '../../shared/components/landing-page/landing-page';


export const publicRoutes: Routes = [
    // ... أي مسارات تانية  حاططها
    { path: '', component: LandingPageComponent, title: 'Smart City - Home' },
    { path: 'user-dashboard', component: UserDashboard, title: 'User Dashboard' },
    { path: 'profile', component: UserProfileComponent, title: 'User Profile' }
];