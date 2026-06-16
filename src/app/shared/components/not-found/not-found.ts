import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// src/app/shared/components/not-found/not-found.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [FontAwesomeModule, RouterLink],
  template: `
    <div class="not-found-container">
      <div class="glitch-wrapper">
        <h1 class="glitch" data-text="404">404</h1>
      </div>
      
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>

      <div class="content">
        <h2>Page Lost in Space</h2>
        <p>The page you're looking for has drifted into the digital void.</p>
        
        <div class="actions">
          <a routerLink="/" class="btn-primary">
            <fa-icon [icon]="['fas', 'arrow-left']" class="btn-icon"></fa-icon>
            Back to Home
          </a>
          <button class="btn-secondary" (click)="goBack()">
            Go Back
          </button>
        </div>
      </div>

      <div class="scan-line"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #0A0F12;
      overflow: hidden;
      position: relative;
    }

    .not-found-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 2rem;
    }

    .glitch-wrapper {
      position: relative;
      margin-bottom: 2rem;
    }

    .glitch {
      font-size: clamp(8rem, 20vw, 15rem);
      font-weight: 900;
      color: #FF6A3D;
      position: relative;
      text-shadow: 
        0 0 10px rgba(255, 106, 61, 0.5),
        0 0 20px rgba(255, 106, 61, 0.3),
        0 0 40px rgba(255, 106, 61, 0.1);
      animation: glitch-skew 3s infinite;
    }

    .glitch::before,
    .glitch::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .glitch::before {
      color: #00fff9;
      animation: glitch-1 2s infinite linear alternate-reverse;
      clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
    }

    .glitch::after {
      color: #ff00ff;
      animation: glitch-2 3s infinite linear alternate-reverse;
      clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
    }

    @keyframes glitch-1 {
      0%, 100% { transform: translate(0); }
      20% { transform: translate(-3px, 3px); }
      40% { transform: translate(-3px, -3px); }
      60% { transform: translate(3px, 3px); }
      80% { transform: translate(3px, -3px); }
    }

    @keyframes glitch-2 {
      0%, 100% { transform: translate(0); }
      20% { transform: translate(3px, -3px); }
      40% { transform: translate(3px, 3px); }
      60% { transform: translate(-3px, -3px); }
      80% { transform: translate(-3px, 3px); }
    }

    @keyframes glitch-skew {
      0%, 100% { transform: skew(0deg); }
      10% { transform: skew(-2deg); }
      20% { transform: skew(2deg); }
      30% { transform: skew(0deg); }
      90% { transform: skew(1deg); }
    }

    .floating-shapes {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
    }

    .shape-1 {
      width: 300px;
      height: 300px;
      top: -100px;
      right: -100px;
      background: #FF6A3D;
      animation: float 8s ease-in-out infinite;
    }

    .shape-2 {
      width: 200px;
      height: 200px;
      bottom: -50px;
      left: -50px;
      background: #00fff9;
      animation: float 10s ease-in-out infinite reverse;
    }

    .shape-3 {
      width: 150px;
      height: 150px;
      top: 50%;
      left: 20%;
      background: #FF6A3D;
      animation: float 12s ease-in-out infinite;
      animation-delay: -4s;
    }

    .shape-4 {
      width: 100px;
      height: 100px;
      bottom: 30%;
      right: 20%;
      background: #00fff9;
      animation: float 9s ease-in-out infinite reverse;
      animation-delay: -2s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }

    .content {
      text-align: center;
      z-index: 1;
      position: relative;
    }

    .content h2 {
      color: #fff;
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      margin-bottom: 1rem;
      opacity: 0;
      animation: fadeInUp 0.8s ease forwards;
      animation-delay: 0.3s;
    }

    .content p {
      color: rgba(255, 255, 255, 0.6);
      font-size: clamp(1rem, 2vw, 1.2rem);
      margin-bottom: 2.5rem;
      max-width: 400px;
      opacity: 0;
      animation: fadeInUp 0.8s ease forwards;
      animation-delay: 0.5s;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      opacity: 0;
      animation: fadeInUp 0.8s ease forwards;
      animation-delay: 0.7s;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.875rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #FF6A3D;
      color: #0A0F12;
      border: none;
    }

    .btn-primary:hover {
      background: #ff855d;
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(255, 106, 61, 0.3);
    }

    .btn-secondary {
      background: transparent;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:hover {
      border-color: #FF6A3D;
      color: #FF6A3D;
      transform: translateY(-2px);
    }

    .btn-icon {
      transition: transform 0.3s ease;
    }

    .btn-primary:hover .btn-icon {
      transform: translateX(-3px);
    }

    .scan-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #FF6A3D, transparent);
      opacity: 0.5;
      animation: scan 4s linear infinite;
    }

    @keyframes scan {
      0% { transform: translateY(-100vh); }
      100% { transform: translateY(100vh); }
    }

    @media (max-width: 480px) {
      .actions { flex-direction: column; width: 100%; }
      .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
    }
  `]
})
export default class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}