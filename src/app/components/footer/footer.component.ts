import { Component } from "@angular/core";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  public readonly devAboutLink = "https://harrydulaney.github.io#contact";
  public readonly issuesLink = "https://github.com/HarryDulaney/pfolie/issues";
  public readonly aboutUsLink = "https://github.com/HarryDulaney/pfolie";

}
