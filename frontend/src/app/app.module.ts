import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Http, HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from '@auth';
import { BackendService } from '@backend';
import { LoginComponent } from 'app/login/login.component';
import { NotFoundComponent } from 'app/not-found/not-found.component';
import { GlobalService } from '@global';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        NotFoundComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        AppRoutingModule
    ],
    providers: [
        AuthGuard,
        GlobalService,
        BackendService
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule { }
