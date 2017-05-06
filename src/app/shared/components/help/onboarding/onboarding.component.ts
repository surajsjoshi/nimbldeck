import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../../environments/environment';
declare var $;
declare var $validator;
declare var refreshAnimation;

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  @Output() finish = new EventEmitter();
  @Output() query = new EventEmitter();
  public createVideo = environment.introVideos.create;
  public shareVideo = environment.introVideos.share;
  public analyseVideo = environment.introVideos.analyse;
  public activeTab = 'create';
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // Initializing the wizard
    // This is required to be called by the plugin
    $('.wizard-card').bootstrapWizard({
      'tabClass': 'nav nav-pills',
      'nextSelector': '.btn-next',
      'previousSelector': '.btn-previous',

      // onNext: function (tab, navigation, index) {
      //   var $valid = $('.wizard-card form').valid();
      //   if (!$valid) {
      //     $validator.focusInvalid();
      //     return false;
      //   }
      // },

      onInit: function (tab, navigation, index) {

        //check number of tabs and fill the entire row
        var $total = navigation.find('li').length;
        var $width = 100 / $total;
        var $wizard = navigation.closest('.wizard-card');

        var $display_width = $(document).width();

        if ($display_width < 600 && $total > 3) {
          $width = 50;
        }

        navigation.find('li').css('width', $width + '%');
        var $first_li = navigation.find('li:first-child a').html();
        var $moving_div = $('<div class="moving-tab">' + $first_li + '</div>');
        $('.wizard-card .wizard-navigation').append($moving_div);
        refreshAnimation($wizard, index);
        $('.moving-tab').css('transition', 'transform 0s');
      },

      // onTabClick: function (tab, navigation, index) {
      //   var $valid = $('.wizard-card form').valid();

      //   if (!$valid) {
      //     return false;
      //   } else {
      //     return true;
      //   }
      // },

      onTabShow: function (tab, navigation, index) {
        var $total = navigation.find('li').length;
        var $current = index + 1;

        var $wizard = navigation.closest('.wizard-card');

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
          $($wizard).find('.btn-next').hide();
          $($wizard).find('.btn-finish').show();
        } else {
          $($wizard).find('.btn-next').show();
          $($wizard).find('.btn-finish').hide();
        }

        var button_text = navigation.find('li:nth-child(' + $current + ') a').html();

        setTimeout(function () {
          $('.moving-tab').text(button_text);
        }, 150);

        refreshAnimation($wizard, index);
      }
    });
  }

  onAskQuery() {
    this.query.emit();
  }

  onFinish() {
    this.finish.emit();
  }
}
