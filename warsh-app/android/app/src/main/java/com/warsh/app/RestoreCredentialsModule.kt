package com.warsh.app

import android.os.Build
import android.os.CancellationSignal
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CreateCredentialResponse
import androidx.credentials.CreateRestoreCredentialRequest
import androidx.credentials.CreateRestoreCredentialResponse
import androidx.credentials.CredentialManager
import androidx.credentials.CredentialManagerCallback
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.GetRestoreCredentialOption
import androidx.credentials.RestoreCredential
import androidx.credentials.exceptions.ClearCredentialException
import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import androidx.credentials.exceptions.restorecredential.E2eeUnavailableException
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.concurrent.Executors

/**
 * Android Restore Credentials (Credential Manager restore keys) for Zero-Tap
 * Sign-In. The JS side owns the flow — it fetches the WebAuthn options from
 * the Warsh API, calls these three methods, and posts the responses back —
 * so this module is a thin, promise-based bridge over Credential Manager.
 *
 * Every method resolves rather than rejects for the expected "not available"
 * states (old Android, no Play services, no key on this device, backup not
 * end-to-end encrypted) so the caller can fall back to the login screen
 * without treating them as errors.
 */
class RestoreCredentialsModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  private val executor = Executors.newSingleThreadExecutor()

  override fun getName(): String = "WarshRestoreCredentials"

  private fun supported(): Boolean = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P

  @ReactMethod
  fun isSupported(promise: Promise) {
    promise.resolve(supported())
  }

  /**
   * Creates the restore key for `requestJson` (a WebAuthn
   * PublicKeyCredentialCreationOptions issued by the server). Tries a
   * cloud-backed key first; if the device has no end-to-end-encrypted backup
   * (no screen lock / backup off) it retries device-only, as Google's guide
   * requires, and reports which one it made.
   *
   * Resolves `{ status: "created", cloudBackup, responseJson }`,
   * `{ status: "unsupported" }`, or `{ status: "failed", reason }`.
   */
  @ReactMethod
  fun createRestoreCredential(requestJson: String, promise: Promise) {
    if (!supported()) {
      promise.resolve(statusMap("unsupported"))
      return
    }
    create(requestJson, cloudBackup = true, promise)
  }

  private fun create(requestJson: String, cloudBackup: Boolean, promise: Promise) {
    val manager = CredentialManager.create(reactContext)
    val request = CreateRestoreCredentialRequest(requestJson, isCloudBackupEnabled = cloudBackup)
    manager.createCredentialAsync(
      reactContext,
      request,
      CancellationSignal(),
      executor,
      object : CredentialManagerCallback<CreateCredentialResponse, CreateCredentialException> {
        override fun onResult(result: CreateCredentialResponse) {
          val response = result as? CreateRestoreCredentialResponse
          if (response == null) {
            promise.resolve(failure("unexpected_response:${result.javaClass.simpleName}"))
            return
          }
          promise.resolve(
            statusMap("created").apply {
              putBoolean("cloudBackup", cloudBackup)
              putString("responseJson", response.responseJson)
            }
          )
        }

        override fun onError(e: CreateCredentialException) {
          if (cloudBackup && e is E2eeUnavailableException) {
            // Documented fallback: keep a device-only key so the account can
            // still restore through a device-to-device transfer.
            create(requestJson, cloudBackup = false, promise)
            return
          }
          promise.resolve(failure(e.javaClass.simpleName))
        }
      }
    )
  }

  /**
   * Retrieves the restore key carried onto this device and signs the server's
   * challenge with it (`requestJson` is a WebAuthn
   * PublicKeyCredentialRequestOptions). No UI is shown.
   *
   * Resolves `{ status: "found", responseJson }`, `{ status: "none" }` when
   * the device holds no key, `{ status: "unsupported" }`, or
   * `{ status: "failed", reason }`.
   */
  @ReactMethod
  fun getRestoreCredential(requestJson: String, promise: Promise) {
    if (!supported()) {
      promise.resolve(statusMap("unsupported"))
      return
    }
    val manager = CredentialManager.create(reactContext)
    val request = GetCredentialRequest(listOf(GetRestoreCredentialOption(requestJson)))
    manager.getCredentialAsync(
      reactContext,
      request,
      CancellationSignal(),
      executor,
      object : CredentialManagerCallback<GetCredentialResponse, GetCredentialException> {
        override fun onResult(result: GetCredentialResponse) {
          val credential = result.credential as? RestoreCredential
          if (credential == null) {
            promise.resolve(failure("unexpected_credential:${result.credential.javaClass.simpleName}"))
            return
          }
          promise.resolve(
            statusMap("found").apply {
              putString("responseJson", credential.authenticationResponseJson)
            }
          )
        }

        override fun onError(e: GetCredentialException) {
          if (e is NoCredentialException) {
            promise.resolve(statusMap("none"))
            return
          }
          promise.resolve(failure(e.javaClass.simpleName))
        }
      }
    )
  }

  /** Deletes the local restore key (sign-out, account deletion, server 401). */
  @ReactMethod
  fun clearRestoreCredential(promise: Promise) {
    if (!supported()) {
      promise.resolve(statusMap("unsupported"))
      return
    }
    val manager = CredentialManager.create(reactContext)
    val request = ClearCredentialStateRequest(ClearCredentialStateRequest.TYPE_CLEAR_RESTORE_CREDENTIAL)
    manager.clearCredentialStateAsync(
      request,
      CancellationSignal(),
      executor,
      object : CredentialManagerCallback<Void?, ClearCredentialException> {
        override fun onResult(result: Void?) {
          promise.resolve(statusMap("cleared"))
        }

        override fun onError(e: ClearCredentialException) {
          promise.resolve(failure(e.javaClass.simpleName))
        }
      }
    )
  }

  private fun statusMap(status: String) = Arguments.createMap().apply { putString("status", status) }

  private fun failure(reason: String) = statusMap("failed").apply { putString("reason", reason) }
}
