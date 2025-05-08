package com.app

import android.widget.EditText
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.common.annotations.UnstableReactNativeAPI

class CaretModule(private val reactContext: ReactApplicationContext)
  : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "CaretModule"

  @ReactMethod
  fun getCaretLine(viewTag: Double, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        val uiManager = UIManagerHelper.getUIManager(reactContext, viewTag.toInt())
        val view = uiManager?.resolveView(viewTag.toInt()) as? EditText
            ?: return@runOnUiThread promise.resolve(0)

        val line = view.layout?.getLineForOffset(view.selectionStart) ?: 0
        promise.resolve(line)

      } catch (e: Exception) {
        promise.reject("E_CARET", e.message, e)
      }
    }
  }

  @ReactMethod
    fun getCaretRect(viewTag: Double, promise: Promise) {
      UiThreadUtil.runOnUiThread {
        try {
          val uiManager =
            UIManagerHelper.getUIManager(reactContext, viewTag.toInt())
          val edit =
            uiManager?.resolveView(viewTag.toInt()) as? EditText
              ?: return@runOnUiThread promise.resolve(null)

          val layout = edit.layout ?: return@runOnUiThread promise.resolve(null)
          val offset = edit.selectionStart.coerceAtLeast(0)

          val x = layout.getPrimaryHorizontal(offset)
          val line = layout.getLineForOffset(offset)
          val y = layout.getLineTop(line).toFloat()

          val caretX = x + edit.totalPaddingLeft
          val caretY = y + edit.totalPaddingTop
          val caretH = edit.lineHeight.toFloat()
          val caretW = 2f

          val loc = IntArray(2)
          edit.getLocationOnScreen(loc)
          val absX = loc[0] + caretX
          val absY = loc[1] + caretY

          val map = Arguments.createMap().apply {
            putDouble("x", absX.toDouble())
            putDouble("y", absY.toDouble())
            putDouble("w", caretW.toDouble())
            putDouble("h", caretH.toDouble())
          }
          promise.resolve(map)

        } catch (e: Exception) {
          promise.reject("E_CARET", e.message, e)
        }
      }
    }
}
