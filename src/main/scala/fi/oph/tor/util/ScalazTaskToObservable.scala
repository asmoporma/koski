package fi.oph.tor.util

import fi.oph.tor.log.Logging
import rx.lang.scala.Observable
import rx.lang.scala.subjects.ReplaySubject

import scala.concurrent.Promise
import scalaz.concurrent.Task

object ScalazTaskToObservable extends Logging {
  implicit def taskToObservable[A](x: => Task[A]): Observable[A] = {
    val subject = ReplaySubject[A](1)
    import scalaz.{-\/, \/-}
    val p: Promise[A] = Promise()
    x.runAsync {
      case -\/(ex) =>
        subject.onError(ex)
      case \/-(r) =>
        subject.onNext(r)
    }
    subject
  }
}