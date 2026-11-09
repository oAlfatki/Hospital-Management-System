using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace HSMAPI.Contracts;

// HTML time controls submit HH:mm; System.Text.Json's default TimeOnly reader requires seconds.
public sealed class TimeOnlyConverter : JsonConverter<TimeOnly>
{
    public override TimeOnly Read(ref Utf8JsonReader reader, Type type, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String && TimeOnly.TryParseExact(reader.GetString(),
            ["HH:mm", "HH:mm:ss", "HH:mm:ss.FFFFFFF"], CultureInfo.InvariantCulture, DateTimeStyles.None, out var time)) return time;
        throw new JsonException("Time must use HH:mm or HH:mm:ss.");
    }
    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options) => writer.WriteStringValue(value.ToString("HH:mm:ss", CultureInfo.InvariantCulture));
}
