using Leaf;
using Leaf.Models;

namespace Leaf.Tests;

public class UnitTest1
{
    [Fact]
    public void LeafMarker_CapturesCoordinatesAndPopup()
    {
        var marker = new LeafMarker(48.8566, 2.3522, "Paris", "paris-id");

        Assert.Equal(48.8566, marker.Latitude);
        Assert.Equal(2.3522, marker.Longitude);
        Assert.Equal("Paris", marker.Popup);
        Assert.Equal("paris-id", marker.Id);
    }

    [Fact]
    public void LeafMapEngine_ExposesLeafletAndMapLibreValues()
    {
        var values = Enum.GetNames<LeafMapEngine>();

        Assert.Contains("Leaflet", values);
        Assert.Contains("MapLibre", values);
    }
}
