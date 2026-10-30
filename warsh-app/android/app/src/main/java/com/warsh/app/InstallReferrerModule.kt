package com.warsh.app

import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class InstallReferrerModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "WarshInstallReferrer"

  @ReactMethod
  fun getReferrer(promise: Promise) {
    val client = InstallReferrerClient.newBuilder(reactApplicationContext).build()
    client.startConnection(object : InstallReferrerStateListener {
      override fun onInstallReferrerSetupFinished(responseCode: Int) {
        try {
          if (responseCode == InstallReferrerClient.InstallReferrerResponse.OK) {
            promise.resolve(client.installReferrer.installReferrer)
          } else {
            promise.resolve(null)
          }
        } catch (_: Exception) {
          promise.resolve(null)
        } finally {
          client.endConnection()
        }
      }
      override fun onInstallReferrerServiceDisconnected() { promise.resolve(null) }
    })
  }
}
