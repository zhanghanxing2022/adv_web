import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RegisterComponent } from './register/register.component';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomepageComponent } from './homepage/homepage.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { ChatComponent } from './chat/chat.component';
import { SocketIoService } from './socket-io.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { MatCardModule } from '@angular/material/card';
import * as THREE from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts';
import { PersonalCenterComponent } from './personal-center/personal-center.component';
import { TestComponent } from './test/test.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HomepageComponent,
    PersonalInfoComponent,
    ChatComponent,
    PersonalCenterComponent,
    TestComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    HttpClientModule,
    MatSidenavModule,
    MatListModule,
    FormsModule,
    MatCardModule,
    CommonModule,
    MatRadioModule,
    MatSelectModule,
    MatToolbarModule,
    MatGridListModule,
    MatIconModule,
    RouterModule.forRoot([
      { path : "", component : HomepageComponent },
      { path : "user/login", component : LoginComponent },
      { path : "user/register", component : RegisterComponent},
      { path : "user/personalInfo/:id", component : PersonalInfoComponent },
      { path : "user/personalCenter", component : PersonalCenterComponent},
      { path : "test", component : TestComponent }
    ]),
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
