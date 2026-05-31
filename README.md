# Leaf

[![NuGet](https://img.shields.io/nuget/v/Leaf.svg)](https://www.nuget.org/packages/Leaf/)

Leaf is a .NET 10 Blazor component library that wraps Leaflet and MapLibre with a clean API for markers, clustering, popups, and draw tools.

## What's included

- **Leaf component library** (`/src/Leaf`)
- **Sample Blazor app** to validate usage (`/samples/Leaf.SampleApp`)
- **Docs site content** for GitHub Pages (`/docs`)
- **GitHub Actions** for CI, NuGet publishing, and Pages deploy (`/.github/workflows`)

## Install

```bash
dotnet add package Leaf
```

## Quick start

1. Include map dependencies in your host app (`Leaflet`, optional `Leaflet.MarkerCluster`, `Leaflet.Draw`, `MapLibre GL`, and optional `Mapbox GL Draw`).
2. Use the `LeafMap` component.

```razor
<LeafMap Engine="LeafMapEngine.Leaflet"
         Latitude="48.8566"
         Longitude="2.3522"
         Zoom="6"
         Markers="markers"
         EnableClustering="true"
         EnableDrawTool="true" />

@code {
    private readonly LeafMarker[] markers =
    [
        new(48.8566, 2.3522, "<strong>Paris</strong>"),
        new(45.7640, 4.8357, "Lyon"),
        new(43.2965, 5.3698, "Marseille")
    ];
}
```

## Run sample app

```bash
dotnet run --project /tmp/workspace/agriffard/Leaf/samples/Leaf.SampleApp
```

## Build and test

```bash
dotnet restore /tmp/workspace/agriffard/Leaf/Leaf.slnx
dotnet build /tmp/workspace/agriffard/Leaf/Leaf.slnx -c Release
dotnet test /tmp/workspace/agriffard/Leaf/Leaf.slnx -c Release
```

## CI/CD

- **CI** workflow builds and tests the solution on pushes and PRs.
- **NuGet** workflow packs the `Leaf` component and pushes on `v*` tags.
- **Pages** workflow deploys `/docs` to GitHub Pages.
