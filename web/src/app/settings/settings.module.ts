import {NgModule} from "@angular/core";
import {SettingsEditorComponent} from "./component/settings-editor.component";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {CommonModule} from "../common/common.module";
import {ReactiveFormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {NgForOf} from "@angular/common";
import {MatChipsModule} from "@angular/material/chips";
import {ReferenceModule} from "../reference/reference.module";
import { MatInputModule } from "@angular/material/input";

@NgModule({
  declarations: [
    SettingsEditorComponent
  ],
    imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        CommonModule,
        ReactiveFormsModule,
        MatSelectModule,
        NgForOf,
        MatChipsModule,
        ReferenceModule,
        MatInputModule
    ],
  exports: [
    SettingsEditorComponent
  ]
})
export class SettingsModule {}
