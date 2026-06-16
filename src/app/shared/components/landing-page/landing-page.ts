import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../i18n/language.service';

interface LangKeys {
// ... (the rest is untouched)

  siteTitle: string;
  home: string;
  features: string;
  howItWorks: string;
  stats: string;
  testimonials: string;
  signIn: string;
  reportIssue: string;
  
  heroBadge: string;
  heroTitle1: string;
  heroTitleHighlight: string;
  heroTitle2: string;
  heroDesc: string;
  heroPrimaryCTA: string;
  heroSecondaryCTA: string;
  
  badgeGps: string;
  badgeDispatch: string;
  badgeSecure: string;
  
  mapTitle: string;
  mapLive: string;
  mapItem1Title: string;
  mapItem1Sub: string;
  mapItem1Status: string;
  mapItem2Title: string;
  mapItem2Sub: string;
  mapItem2Status: string;
  
  featuresSubtitle: string;
  featuresTitle: string;
  featuresDesc: string;
  
  howSubtitle: string;
  howTitle: string;
  howDesc: string;
  
  testSubtitle: string;
  testTitle: string;
  testDesc: string;
  
  ctaTitle: string;
  ctaDesc: string;
  ctaPrimary: string;
  ctaSecondary: string;
  
  footerAbout: string;
  footerLinks1: string;
  footerLinks2: string;
  footerCrew: string;
  footerAdmin: string;
  footerPrivacy: string;
  footerTerms: string;
  footerContact: string;
  footerEmail: string;
  footerPhone: string;
  footerCopy: string;
  footerHeart: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, RouterLink],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPageComponent implements OnInit {
  private themeService = inject(ThemeService);
  private langService = inject(LanguageService);

  get isDarkMode(): boolean {
    return this.themeService.theme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  get currentLang(): 'ar' | 'en' {
    return this.langService.lang();
  }

  ngOnInit() {
    // Global language service handles initialization
  }

  toggleLanguage() {
    this.langService.toggle();
  }

  // Translations dictionary
  translations: Record<'ar' | 'en', LangKeys> = {
    ar: {
      siteTitle: 'المدينة الذكية',
      home: 'الرئيسية',
      features: 'المميزات',
      howItWorks: 'كيف نعمل؟',
      stats: 'الإحصائيات',
      testimonials: 'آراء السكان',
      signIn: 'تسجيل الدخول',
      reportIssue: 'أبلغ عن مشكلة',
      
      heroBadge: 'رؤية جديدة لإدارة المدن والمجتمعات',
      heroTitle1: 'مدينتك، ',
      heroTitleHighlight: 'صوتك',
      heroTitle2: '، مستقبلنا المشترك',
      heroDesc: 'منصة ذكية متكاملة تمكّن المواطنين من رصد والإبلاغ عن مشكلات البنية التحتية والمرافق العامة، وتساعد السلطات والبلديات على توجيه فرق الصيانة وحل البلاغات بكفاءة عالية لبناء مجتمع أرقى وأنظف.',
      heroPrimaryCTA: 'سجل الآن وأبلغ عن مشكلة',
      heroSecondaryCTA: 'استكشف لوحة التحكم',
      
      badgeGps: 'تحديد جغرافي دقيق',
      badgeDispatch: 'معالجة ذكية مؤتمتة',
      badgeSecure: 'أمان وحماية الخصوصية',
      
      mapTitle: 'smartcity-live-map.exe',
      mapLive: 'تحديث لحظي',
      mapItem1Title: 'تراكم نفايات - حي النفل',
      mapItem1Sub: 'المنشئ: محمد أ. منذ 5 دقائق',
      mapItem1Status: 'قيد المراجعة',
      mapItem2Title: 'صيانة إنارة الطريق - الملقا',
      mapItem2Sub: 'تم الإصلاح بواسطة: فريق ب',
      mapItem2Status: 'تم الحل',
      
      featuresSubtitle: 'المميزات الذكية',
      featuresTitle: 'لماذا منصة المدينة الذكية؟',
      featuresDesc: 'نحن لا نقدم مجرد نموذج للتواصل، بل منظومة عمل متكاملة تربط أطراف المجتمع الثلاثة: المواطن، الإدارة، وعمال الصيانة.',
      
      howSubtitle: 'رحلة البلاغ',
      howTitle: 'كيف نعمل؟',
      howDesc: 'بخطوات بسيطة وذكية تبدأ من هاتفك وتنتهي ببيئة حضرية خالية من العيوب.',
      
      testSubtitle: 'آراء وشهادات',
      testTitle: 'شركاء في التغيير والنجاح',
      testDesc: 'ماذا يقول مواطنينا وفرق العمل الميدانية عن تجربتهم مع منصة المدينة الذكية.',
      
      ctaTitle: 'ابدأ المساهمة في تطوير حيك السكني اليوم',
      ctaDesc: 'البلدية والمجتمع متضامنان معاً. أنشئ حسابك الآن، وارسم التغيير في شوارع مدينتك بكبسة زر واحدة.',
      ctaPrimary: 'تسجيل حساب مواطن جديد',
      ctaSecondary: 'تسجيل الدخول للموظفين والجهات',
      
      footerAbout: 'منصة وطنية متكاملة تهدف للرقي بالمدن العربية وتفعيل المشاركة المجتمعية الحية لتحسين الخدمات ومستوى المعيشة الحضرية.',
      footerLinks1: 'الروابط السريعة',
      footerLinks2: 'الجهات والسلطات',
      footerCrew: 'بوابة عمال الصيانة',
      footerAdmin: 'تسجيل الدخول للمشرفين',
      footerPrivacy: 'سياسة الخصوصية',
      footerTerms: 'الشروط والأحكام',
      footerContact: 'تواصل معنا',
      footerEmail: 'البريد الإلكتروني: support@smartcity.gov',
      footerPhone: 'الرقم الموحد: 800-124-CITY',
      footerCopy: '© 2026 منصة المدينة الذكية. جميع الحقوق محفوظة لوزارة الشؤون البلدية والقروية.',
      footerHeart: 'صنع بكل حب من أجل مستقبل أفضل'
    },
    en: {
      siteTitle: 'Smart City',
      home: 'Home',
      features: 'Features',
      howItWorks: 'How It Works',
      stats: 'Statistics',
      testimonials: 'Testimonials',
      signIn: 'Sign In',
      reportIssue: 'Report an Issue',
      
      heroBadge: 'A New Vision for Managing Cities & Communities',
      heroTitle1: 'Your City, ',
      heroTitleHighlight: 'Your Voice',
      heroTitle2: ', Our Shared Future',
      heroDesc: 'An integrated smart platform enabling citizens to report infrastructure and public facility issues, helping municipal authorities assign maintenance crews and resolve reports with high efficiency for a cleaner, better community.',
      heroPrimaryCTA: 'Register & Report Now',
      heroSecondaryCTA: 'Explore Dashboard',
      
      badgeGps: 'Precise GPS Pinpointing',
      badgeDispatch: 'Automated Smart Dispatch',
      badgeSecure: 'Secure & Private',
      
      mapTitle: 'smartcity-live-map.exe',
      mapLive: 'Live Updates',
      mapItem1Title: 'Waste Accumulation - Nafil',
      mapItem1Sub: 'By Mohamed A. 5m ago',
      mapItem1Status: 'Under Review',
      mapItem2Title: 'Streetlight Repair - Malqa',
      mapItem2Sub: 'Resolved by: Crew B',
      mapItem2Status: 'Resolved',
      
      featuresSubtitle: 'SMART FEATURES',
      featuresTitle: 'Why Smart City Platform?',
      featuresDesc: "We don't just provide a feedback form, but a complete ecosystem connecting citizens, municipal authorities, and maintenance workers.",
      
      howSubtitle: 'REPORT JOURNEY',
      howTitle: 'How It Works',
      howDesc: 'Simple, smart steps starting from your phone and ending with a flawless urban environment.',
      
      testSubtitle: 'COMMUNITY IMPACT',
      testTitle: 'Partners in Change & Success',
      testDesc: 'Hear from our citizens and field workers about their experience with the Smart City platform.',
      
      ctaTitle: 'Start improving your neighborhood today',
      ctaDesc: 'Municipality and community working hand-in-hand. Create your account now and shape the change in your city with one click.',
      ctaPrimary: 'Register New Citizen Account',
      ctaSecondary: 'Portal for Staff & Authorities',
      
      footerAbout: 'A national integrated platform designed to elevate modern cities, activating civic participation to improve public services and urban living standards.',
      footerLinks1: 'Quick Links',
      footerLinks2: 'Authorities & Staff',
      footerCrew: 'Maintenance Staff Portal',
      footerAdmin: 'Admin Portal',
      footerPrivacy: 'Privacy Policy',
      footerTerms: 'Terms & Conditions',
      footerContact: 'Contact Us',
      footerEmail: 'Email: support@smartcity.gov',
      footerPhone: 'Hotline: 800-124-CITY',
      footerCopy: '© 2026 Smart City Platform. All rights reserved.',
      footerHeart: 'Made with love for a better future'
    }
  };

  get t(): LangKeys {
    return this.translations[this.currentLang];
  }

  // English lists
  statsEn = [
    { value: '15k+', label: 'Active Citizens', icon: 'users' },
    { value: '4,820+', label: 'Resolved Issues', icon: 'circle-check' },
    { value: '98%', label: 'Service Coverage', icon: 'map-location-dot' },
    { value: '2.4h', label: 'Avg. Response Time', icon: 'bolt' }
  ];

  featuresEn = [
    {
      title: 'Interactive Map Reports',
      description: 'Mark the exact location of infrastructure issues on the live map and upload photos and details instantly.',
      icon: 'map-location-dot',
      color: 'from-orange-500/10 to-amber-500/10 border-orange-500/20 text-orange-500'
    },
    {
      title: 'Smart Task Allocation',
      description: 'Reports are automatically analyzed and assigned to the nearest maintenance crews based on category and location.',
      icon: 'route',
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500'
    },
    {
      title: 'Real-Time Tracking',
      description: 'Track the progress of your reported issues step-by-step from submission to confirmation and final resolution.',
      icon: 'eye',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500'
    }
  ];

  stepsEn = [
    {
      number: '01',
      title: 'Report & Pin',
      description: 'Snap a photo of the problem (pothole, broken streetlight, waste) and mark its exact location on the map.',
      icon: 'camera'
    },
    {
      number: '02',
      title: 'Smart Routing',
      description: 'The system instantly routes the report to the responsible municipality department and field crew.',
      icon: 'gears'
    },
    {
      number: '03',
      title: 'Resolve & Fix',
      description: 'Assigned workers arrive on-site, resolve the problem, and document the completed work with live photos.',
      icon: 'screwdriver-wrench'
    },
    {
      number: '04',
      title: 'Notify & Confirm',
      description: 'Receive a push notification once resolved, including before/after evidence to ensure transparency.',
      icon: 'circle-check'
    }
  ];

  testimonialsEn = [
    {
      name: 'Ahmed Mahmoud',
      role: 'Citizen - Yasmin District',
      avatarColor: 'bg-gradient-to-tr from-orange-400 to-amber-500',
      comment: 'The platform completely transformed how we communicate with the city! I reported a broken streetlight and it was fixed the same day.'
    },
    {
      name: 'Sarah Al-Otaibi',
      role: 'Citizen - Narjis District',
      avatarColor: 'bg-gradient-to-tr from-blue-400 to-indigo-500',
      comment: 'The interactive map is incredibly easy to use. It makes every citizen an active partner in improving our neighborhood.'
    },
    {
      name: 'Eng. Khalid Al-Harbi',
      role: 'Sub-Municipality Supervisor',
      avatarColor: 'bg-gradient-to-tr from-emerald-400 to-teal-500',
      comment: 'This system has streamlined our work dispatching and report tracking. It boosted citizen satisfaction by 40%.'
    }
  ];

  // Arabic lists
  statsAr = [
    { value: '١٥ ألف+', label: 'مواطن نشط', icon: 'users' },
    { value: '٤,٨٢٠+', label: 'بلاغ تم حلّه', icon: 'circle-check' },
    { value: '٩٨٪', label: 'تغطية الخدمة', icon: 'map-location-dot' },
    { value: '٢.٤س', label: 'معدل الاستجابة', icon: 'bolt' }
  ];

  featuresAr = [
    {
      title: 'خريطة البلاغات التفاعلية',
      description: 'حدد موقع المشكلة الجغرافية مباشرة على الخريطة وارفع الصور والتفاصيل لتصل للجهة المعنية فوراً دون تعقيد.',
      icon: 'map-location-dot',
      color: 'from-orange-500/10 to-amber-500/10 border-orange-500/20 text-orange-500'
    },
    {
      title: 'توزيع ذكي للمهام',
      description: 'يتم توجيه وتعيين البلاغات لفرق العمل والعمال المناسبين بناءً على الموقع والتخصص لضمان سرعة التنفيذ.',
      icon: 'route',
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500'
    },
    {
      title: 'متابعة لحظية وشفافية',
      description: 'تابع حالة بلاغك خطوة بخطوة من مرحلة الاستلام، مروراً بالعمل، وحتى التأكيد النهائي بالحل بالصور والبيانات.',
      icon: 'eye',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500'
    }
  ];

  stepsAr = [
    {
      number: '٠١',
      title: 'رصد وإرسال',
      description: 'التقط صورة للمشكلة (حفرة، إنارة معطلة، نفايات) وحدد موقعها الجغرافي على الخريطة.',
      icon: 'camera'
    },
    {
      number: '٠٢',
      title: 'توجيه ذكي',
      description: 'تقوم المنصة فوراً بتحليل البلاغ وتوجيهه إلى الجهة المسؤولة وفريق الصيانة الميداني الأقرب.',
      icon: 'gears'
    },
    {
      number: '٠٣',
      title: 'إصلاح وحل',
      description: 'ينتقل العامل المختص للموقع ويقوم بحل المشكلة وتوثيق العمل بصورة حية للمراجعة.',
      icon: 'screwdriver-wrench'
    },
    {
      number: '٠٤',
      title: 'تأكيد وإشعار',
      description: 'يصلك إشعار فوري بنجاح العملية مع صورة قبل وبعد الإصلاح لضمان الجودة والرضا.',
      icon: 'circle-check'
    }
  ];

  testimonialsAr = [
    {
      name: 'أحمد محمود',
      role: 'مواطن - حي الياسمين',
      avatarColor: 'bg-gradient-to-tr from-orange-400 to-amber-500',
      comment: 'المنصة غيرت مفهوم التواصل مع البلدية تماماً! أبلغت عن عمود إنارة معطل وتم إصلاحه في نفس اليوم.'
    },
    {
      name: 'سارة العتيبي',
      role: 'مواطنة - حي النرجس',
      avatarColor: 'bg-gradient-to-tr from-blue-400 to-indigo-500',
      comment: 'سهولة استخدام الخريطة ودقة التتبع تجعل كل فرد في المجتمع شريكاً فعالاً في تطوير مدينتنا.'
    },
    {
      name: 'م. خالد الحربي',
      role: 'مشرف بلدية فرعي',
      avatarColor: 'bg-gradient-to-tr from-emerald-400 to-teal-500',
      comment: 'المنظومة أتاحت لنا إدارة البلاغات وتوجيه العمال بشكل مؤتمت وسريع، مما رفع نسبة رضا السكان بشكل كبير.'
    }
  ];

  get stats() {
    return this.currentLang === 'ar' ? this.statsAr : this.statsEn;
  }
  get features() {
    return this.currentLang === 'ar' ? this.featuresAr : this.featuresEn;
  }
  get steps() {
    return this.currentLang === 'ar' ? this.stepsAr : this.stepsEn;
  }
  get testimonials() {
    return this.currentLang === 'ar' ? this.testimonialsAr : this.testimonialsEn;
  }

  mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
