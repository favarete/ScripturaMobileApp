package com.app

import android.content.Context
import android.view.inputmethod.InputMethodManager
import android.view.inputmethod.InputMethodSubtype
import com.facebook.react.bridge.*

class KeyboardModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "KeyboardModule"
    }

    @ReactMethod
    fun isPhysicalKeyboardConnected(promise: Promise) {
        try {
            val imm = reactApplicationContext.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            val inputMethodSubtype: InputMethodSubtype? = imm.currentInputMethodSubtype

            val isPhysical = inputMethodSubtype?.mode == "keyboard"
            promise.resolve(isPhysical)
        } catch (e: Exception) {
            promise.reject("ERROR", "Something went wrong while checking for physical keyboard: ${e.message}")
        }
    }
}
