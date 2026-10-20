#!/usr/bin/env bash
# Builds bin/out/MellowProbe.dll (runacc.sh -t copies it into each run's folder) and copies it to
# %LOCALAPPDATA%\MellowProbe\ for acad.exe: AutoCAD will not NETLOAD from \\wsl.localhost.
#
#   scripts/research/mellowprobe/build.sh
#
# Needs the .NET 10 SDK in WSL (AutoCAD 2027's managed API is net10.0):
#   curl -sSL https://dot.net/v1/dotnet-install.sh | bash -s -- --channel 10.0
# It references the assemblies of the installed AutoCAD (AcadDir), so no NuGet package is needed.
set -euo pipefail
cd "$(dirname "$0")"
export PATH="$HOME/.dotnet:$PATH" DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1
# WSL has no libicu by default; the build does not need culture data.
export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1
dotnet build -c Release -o bin/out -v quiet -nologo | grep -E "error|warn" || true
dest=$(wslpath "$(cmd.exe /c echo %LOCALAPPDATA% 2>/dev/null | tr -d '\r')")/MellowProbe
mkdir -p "$dest"
if ! cp bin/out/MellowProbe.dll "$dest/" 2>/dev/null; then
  # .NET cannot unload an assembly: an acad.exe that NETLOADed it holds the file until it exits.
  echo "Built, but $dest/MellowProbe.dll is in use by an acad.exe: close it to update that copy." >&2
  exit 0
fi
echo "$(wslpath -w "$dest")\\MellowProbe.dll"
