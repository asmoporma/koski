package fi.oph.koski.db

import fi.oph.koski.db.KoskiDatabase.DB
import fi.oph.koski.db.PostgresDriverWithJsonSupport.api._
import fi.oph.koski.executors.Pools
import fi.oph.koski.util.Futures
import fi.oph.koski.util.ReactiveStreamsToRx.publisherToObservable
import slick.dbio.{DBIOAction, NoStream}
import slick.lifted.Query

import scala.concurrent.duration._
import scala.concurrent.duration.Duration
import scala.language.higherKinds

trait KoskiDatabaseMethods {
  protected def db: DB

  def runDbSync[R](a: DBIOAction[R, NoStream, Nothing], skipCheck: Boolean = false, timeout: Duration = 60.seconds): R = {
    if (!skipCheck && Thread.currentThread().getName.startsWith(Pools.databasePoolName)) {
      throw new RuntimeException("Nested transaction detected! Don't call runDbSync in a nested manner, as it will cause deadlocks.")
    }
    Futures.await(db.run(a), atMost = timeout)
  }

  def streamingQuery[E, U, C[_]](query: Query[E, U, C]) = {
    // Note: it won't actually stream unless you use both `transactionally` and `fetchSize`. It'll collect all the data into memory.
    publisherToObservable(db.stream(query.result.transactionally.withStatementParameters(fetchSize = 1000))).publish.refCount
  }
}
