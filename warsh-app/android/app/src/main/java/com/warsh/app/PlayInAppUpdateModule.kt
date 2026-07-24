package com.warsh.app

import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability

class PlayInAppUpdateModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "WarshInAppUpdates"

  @ReactMethod
  fun getUpdateInfo(promise: Promise) {
    val manager = AppUpdateManagerFactory.create(reactContext)

    manager.appUpdateInfo
      .addOnSuccessListener { info ->
        val availability = info.updateAvailability()
        val updateIsKnown =
          availability == UpdateAvailability.UPDATE_AVAILABLE ||
            availability == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS
        val availableVersionCode = if (updateIsKnown) info.availableVersionCode() else 0
        val updateAvailable =
          updateIsKnown && availableVersionCode > BuildConfig.VERSION_CODE

        val result = Arguments.createMap().apply {
          putBoolean("supported", true)
          putBoolean("installedFromPlay", installedFromGooglePlay())
          putBoolean("available", updateAvailable)
          putInt("installedVersionCode", BuildConfig.VERSION_CODE)
          putInt("availableVersionCode", availableVersionCode)
          putInt("availability", availability)
          putInt("priority", if (updateAvailable) info.updatePriority() else 0)
          putBoolean(
            "flexibleAllowed",
            updateAvailable && info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)
          )
          putBoolean(
            "immediateAllowed",
            updateAvailable && info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
          )
          info.clientVersionStalenessDays()?.let {
            putInt("stalenessDays", it)
          }
        }

        promise.resolve(result)
      }
      .addOnFailureListener { error ->
        // Preview APKs and sideloaded builds are not owned by Google Play.
        // That is an expected state, so resolve a quiet diagnostic result
        // instead of surfacing a production error to Sentry.
        val result = Arguments.createMap().apply {
          putBoolean("supported", true)
          putBoolean("installedFromPlay", installedFromGooglePlay())
          putBoolean("available", false)
          putInt("installedVersionCode", BuildConfig.VERSION_CODE)
          putInt("availableVersionCode", 0)
          putInt("availability", UpdateAvailability.UNKNOWN)
          putInt("priority", 0)
          putBoolean("flexibleAllowed", false)
          putBoolean("immediateAllowed", false)
          putString("diagnostic", error.javaClass.simpleName)
        }
        promise.resolve(result)
      }
  }

  private fun installedFromGooglePlay(): Boolean {
    return try {
      val packageManager = reactContext.packageManager
      val packageName = reactContext.packageName
      val installer = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        packageManager.getInstallSourceInfo(packageName).installingPackageName
      } else {
        @Suppress("DEPRECATION")
        packageManager.getInstallerPackageName(packageName)
      }
      installer == "com.android.vending"
    } catch (_: Exception) {
      false
    }
  }
}
