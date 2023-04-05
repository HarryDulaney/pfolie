import { Component } from "@angular/core";
import { PROJECT_LINKS } from "src/app/constants";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: true,
    imports: [RouterLink]
})
export class FooterComponent {
  public readonly devAboutLink = PROJECT_LINKS.CONTACT;
  public readonly issuesLink = PROJECT_LINKS.ISSUES;
  public readonly aboutUsLink = PROJECT_LINKS.ABOUT;

}
