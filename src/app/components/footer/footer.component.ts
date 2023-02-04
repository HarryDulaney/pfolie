import { Component } from "@angular/core";
import { PROJECT_LINKS } from "src/app/common/constants";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  public readonly devAboutLink = PROJECT_LINKS.CONTACT;
  public readonly issuesLink = PROJECT_LINKS.ISSUES;
  public readonly aboutUsLink = PROJECT_LINKS.ABOUT;

}
