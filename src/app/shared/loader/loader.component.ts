import { Component, input } from '@angular/core';

@Component({
  selector: 'sprk-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  message = input<string>('Loading...');
  showSpinner = input<boolean>(true);
}
