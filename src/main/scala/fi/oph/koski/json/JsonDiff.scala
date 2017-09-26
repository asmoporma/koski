package fi.oph.koski.json

import com.github.fge.jsonpatch.diff.JsonDiff.asJson
import fi.oph.koski.log.Logging
import org.json4s._
import org.json4s.jackson.JsonMethods
import org.json4s.jackson.JsonMethods.asJsonNode
import scala.reflect.runtime.universe.TypeTag

object JsonDiff extends Logging {
  def jsonDiff(oldValue: JValue, newValue: JValue): JArray = {
    JsonMethods.fromJsonNode(asJson(asJsonNode(oldValue), asJsonNode(newValue))).asInstanceOf[JArray]
  }

  def objectDiff[A : TypeTag](a: A, b: A) = {
    jsonDiff(JsonSerializer.serializeWithRoot(a), JsonSerializer.serializeWithRoot(b))
  }
}
