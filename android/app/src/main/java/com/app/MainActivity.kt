package com.app

import android.os.Bundle;
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import android.view.KeyEvent;
import com.github.kevinejohn.keyevent.KeyEventModule;

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "App"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  //react-native-screens override
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null);
  }

   override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
      // A. Prevent multiple events on long button press
      //    In the default behavior multiple events are fired if a button
      //    is pressed for a while. You can prevent this behavior if you
      //    forward only the first event:
      //        if (event.getRepeatCount() == 0) {
      //            KeyEventModule.getInstance().onKeyDownEvent(keyCode, event);
      //        }
      //
      // B. If multiple Events shall be fired when the button is pressed
      //    for a while use this code:
      //        KeyEventModule.getInstance().onKeyDownEvent(keyCode, event);
      //
      // Using B.
      KeyEventModule.getInstance().onKeyDownEvent(keyCode, event)

      // There are 2 ways this can be done:
      //  1.  Override the default keyboard event behavior
      //    super.onKeyDown(keyCode, event);
      //    return true;

      //  2.  Keep default keyboard event behavior
      //    return super.onKeyDown(keyCode, event);

      // Using method #2 without blocking multiple
      return super.onKeyDown(keyCode, event);
  }

  override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
      KeyEventModule.getInstance().onKeyUpEvent(keyCode, event)

      // There are 2 ways this can be done:
      //  1.  Override the default keyboard event behavior
      //    super.onKeyUp(keyCode, event);
      //    return true;

      //  2.  Keep default keyboard event behavior
      //    return super.onKeyUp(keyCode, event);

      // Using method #2
      return super.onKeyUp(keyCode, event);
  }

  // override fun onKeyMultiple(keyCode: Int, repeatCount: Int, event: KeyEvent?): Boolean {
  //     KeyEventModule.getInstance().onKeyMultipleEvent(keyCode, repeatCount, event)
  //     return super.onKeyMultiple(keyCode, repeatCount, event)
  // }
}
